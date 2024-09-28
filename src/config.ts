import { z, ZodError, ZodNumber, ZodBoolean, ZodArray, ZodEnum } from "zod";

export function environmentVariable<T extends z.ZodTypeAny>(
  key: string,
  schema: T,
  defaultValue?: z.infer<T>,
  customCast?: (value: any) => any
): z.ZodEffects<T> {
  return z.preprocess((value) => {
    const envVariableValue = process.env[key];

    const rawEnvValue =
      envVariableValue !== undefined ? envVariableValue : value ?? defaultValue;

    if (customCast) {
      return customCast(rawEnvValue);
    }

    // Type narrowing using instanceof
    if (schema instanceof ZodNumber || schema._def.typeName === "ZodNumber") {
      const parsedNumber = Number(rawEnvValue);
      return isNaN(parsedNumber) ? defaultValue : parsedNumber;
    }

    if (schema instanceof ZodBoolean || schema._def.typeName === "ZodBoolean") {
      return rawEnvValue === "true";
    }

    if (schema instanceof ZodArray || schema._def.typeName === "ZodArray") {
      if (typeof rawEnvValue === "string") {
        return (rawEnvValue as string).length > 0
          ? (rawEnvValue as string).split(",")
          : defaultValue;
      }
      return defaultValue;
    }

    if (schema instanceof ZodEnum || schema._def.typeName === "ZodEnum") {
      return (
        schema as unknown as ZodEnum<[string, ...string[]]>
      ).options.includes(rawEnvValue as any)
        ? rawEnvValue
        : defaultValue;
    }

    // Default case for strings and other types
    return rawEnvValue;
  }, schema);
}

export function createValidatedConfig<T extends z.ZodRawShape>(
  configSchema: z.ZodObject<T>,
  configMap: Record<string, any> = {}
): z.infer<typeof configSchema> {
  try {
    const parsedConfig = configSchema.parse(configMap);
    return parsedConfig;
  } catch (error: any) {
    if (error instanceof ZodError) {
      const errorMessages = error.errors
        .map((issue) => {
          const path = issue.path.join(".");
          let message = issue.message;
          return `- ${path}: ${message}`;
        })
        .join("\n");

      console.log("An error occurred during configuration validation.\n");
      console.error(`Errors:\n ${errorMessages}`);
      throw error;
    } else {
      throw error;
    }
  }
}

export type InferConfig<T extends z.ZodObject<any>> = z.infer<T>;
