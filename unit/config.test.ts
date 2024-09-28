import { z, ZodError } from "zod";
import { environmentVariable, createValidatedConfig } from "../src/config";

beforeEach(() => {
  process.env = {};
});

describe("environmentVariable function", () => {
  it("should return the value from process.env if it exists", () => {
    process.env["TEST_KEY"] = "localhost";
    const schema = z.string();
    const result = environmentVariable("TEST_KEY", schema, "default").parse(
      undefined
    );
    expect(result).toBe("localhost");
  });

  it("should return the default value if process.env is undefined", () => {
    const schema = z.string();
    const result = environmentVariable(
      "NON_EXISTENT_KEY",
      schema,
      "default"
    ).parse(undefined);
    expect(result).toBe("default");
  });

  it("should cast string value to number when using ZodNumber", () => {
    process.env["PORT"] = "3000";
    const schema = z.number();
    const result = environmentVariable("PORT", schema, 5432).parse(undefined);
    expect(result).toBe(3000);
  });

  it("should return default number when process.env is invalid for ZodNumber", () => {
    process.env["PORT"] = "invalid";
    const schema = z.number();
    const result = environmentVariable("PORT", schema, 5432).parse(undefined);
    expect(result).toBe(5432);
  });

  it("should cast string 'true' to boolean when using ZodBoolean", () => {
    process.env["IS_ENABLED"] = "true";
    const schema = z.boolean();
    const result = environmentVariable("IS_ENABLED", schema, false).parse(
      undefined
    );
    expect(result).toBe(true);
  });

  it("should return the default value for ZodArray when env is a comma-separated string", () => {
    process.env["ARRAY_VALUES"] = "a,b,c";
    const schema = z.array(z.string());
    const result = environmentVariable("ARRAY_VALUES", schema, []).parse(
      undefined
    );
    expect(result).toEqual(["a", "b", "c"]);
  });

  it("should return default value for invalid ZodArray", () => {
    process.env["ARRAY_VALUES"] = "";
    const schema = z.array(z.string());
    const result = environmentVariable("ARRAY_VALUES", schema, [
      "default",
    ]).parse(undefined);
    expect(result).toEqual(["default"]);
  });

  it("should correctly handle ZodEnum", () => {
    process.env["ENVIRONMENT"] = "development";
    const schema = z.enum(["development", "production"]);
    const result = environmentVariable(
      "ENVIRONMENT",
      schema,
      "production"
    ).parse(undefined);
    expect(result).toBe("development");
  });

  it("should return default for invalid ZodEnum", () => {
    process.env["ENVIRONMENT"] = "invalid";
    const schema = z.enum(["development", "production"]);
    const result = environmentVariable(
      "ENVIRONMENT",
      schema,
      "production"
    ).parse(undefined);
    expect(result).toBe("production");
  });
});

describe("createValidatedConfig function", () => {
  const configSchema = z.object({
    host: z.string(),
    port: z.number(),
    username: z.string().min(1),
  });

  it("should validate and return the correct config", () => {
    const configMap = {
      host: "localhost",
      port: 5432,
      username: "admin",
    };

    const result = createValidatedConfig(configSchema, configMap);
    expect(result).toEqual(configMap);
  });

  it("should throw validation error for missing required fields", () => {
    const configMap = {
      host: "localhost",
      port: 5432,
    };

    expect(() => createValidatedConfig(configSchema, configMap)).toThrow(
      ZodError
    );
  });

  it("should format and log validation errors", () => {
    const configMap = {
      host: "localhost",
      port: 5432,
      username: "",
    };

    expect(() =>
      createValidatedConfig(configSchema, configMap)
    ).toThrow();
  });
});
