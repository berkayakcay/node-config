import { z } from "zod";

// import { loadConfig } from "node-config";

// Helper function to simplify environment variable preprocessing and validation
const envVar = <T>(
  key: string,
  transform: (val: any) => T,
  schema: z.ZodType<T, any, any>,
  defaultValue: T
) => {
  return z.preprocess(
    () => transform(process.env[key]), // Fetch the environment variable and transform it
    schema.default(defaultValue) // Apply validation and default
  );
};

// Extend Zod's `.object()` method to automatically add a default empty object
const zDefaultObject = <T extends z.ZodRawShape>(shape: T) => {
  return z.object(shape).default({} as z.infer<z.ZodObject<T>>); // Automatically default to an empty object
};

// Define the schema and use the `envVar` helper
const ServerConfigSchema = z.object({
  port: envVar("PORT", (val) => Number(val), z.number().int().positive(), 3000), // Shortened version
  database: zDefaultObject({
    host: envVar("DB_HOST", (val) => val, z.string(), "localhost"),
    port: envVar("DB_PORT", (val) => Number(val), z.number().int(), 5432),
    username: envVar("DB_USER", (val) => val, z.string(), "root"),
    password: envVar("DB_PASS", (val) => val, z.string(), "password"),
  }),
  testArray: envVar(
    "TEST_ARRAY_VAR",
    (val) => (val as string).split(","),
    z.array(z.string()),
    ["valuex"]
  ),
});

// Parse the config with mapped environment variables
const serverConfig = ServerConfigSchema.parse({});

console.log(serverConfig);
