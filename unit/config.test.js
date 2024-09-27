"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const src_1 = require("../src");
const TestConfigSchema = src_1.envalidation.object({
    // stringVar: envalidation.string().env("TEST_STRING_VAR"),
    // numberVar: envalidation.number().env("TEST_NUMBER_VAR"),
    // booleanVar: envalidation.boolean().env("TEST_BOOLEAN_VAR"),
    // optionalVar: envalidation.string().optional().env("TEST_OPTIONAL_VAR"),
    // defaultVar: envalidation
    //   .string()
    //   .default("defaultValue")
    //   .env("TEST_DEFAULT_VAR"),
    // enumVar: envalidation
    //   .enum(["development", "production"])
    //   .env("TEST_ENUM_VAR"),
    // nestedObject: envalidation.object({
    //   nestedVar: envalidation.number().env("TEST_NESTED_VAR"),
    // }),
    arrayVar: src_1.envalidation
        .string().array()
        .env("TEST_ARRAY_VAR"),
});
beforeEach(() => {
    // Clear all environment variables that start with 'TEST_'
    for (const key of Object.keys(process.env)) {
        if (key.startsWith("TEST_")) {
            delete process.env[key];
        }
    }
});
test("Should load configuration successfully with valid environment variables", () => {
    // process.env.TEST_STRING_VAR = "testString";
    // process.env.TEST_NUMBER_VAR = "123";
    // process.env.TEST_BOOLEAN_VAR = "true";
    // process.env.TEST_ENUM_VAR = "development";
    process.env.TEST_ARRAY_VAR = "value1,value2,value3";
    // process.env.TEST_NESTED_VAR = "42";
    const config = (0, src_1.loadConfig)(TestConfigSchema);
    console.log("CONFIG:", config);
    // expect(config.stringVar).toBe("testString");
    // expect(config.numberVar).toBe(123);
    // expect(config.booleanVar).toBe(true);
    // expect(config.optionalVar).toBeUndefined();
    // expect(config.defaultVar).toBe("defaultValue");
    // expect(config.enumVar).toBe("development");
    expect(config.arrayVar).toEqual(["value1", "value2", "value3"]);
    // expect(config.nestedObject.nestedVar).toBe(42);
});
//# sourceMappingURL=config.test.js.map