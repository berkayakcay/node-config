import { z, ZodError, ZodTypeAny } from "zod";

function getEnvVarName(schema: ZodTypeAny): string | undefined {
  const env = (schema._def as any).env;
  if (env) {
    return env;
  } else if (
    schema instanceof z.ZodOptional ||
    schema instanceof z.ZodNullable
  ) {
    return getEnvVarName(schema.unwrap());
  } else if (schema instanceof z.ZodDefault) {
    return getEnvVarName(schema.removeDefault());
  } else if (schema instanceof z.ZodEffects) {
    return getEnvVarName(schema.innerType());
  } else {
    return undefined;
  }
}

function traverseSchema(
  schema: ZodTypeAny,
  path: string[] = []
): [string[], ZodTypeAny][] {
  if (schema instanceof z.ZodObject) {
    const shape = schema.shape;
    let entries: [string[], ZodTypeAny][] = [];
    for (const key in shape) {
      const childSchema = shape[key];
      const childEntries = traverseSchema(childSchema, [...path, key]);
      entries = entries.concat(childEntries);
    }
    return entries;
  } else {
    const envVarName = getEnvVarName(schema);
    if (envVarName) {
      return [[path, schema]];
    } else {
      return [];
    }
  }
}

export function loadConfig<T extends z.ZodTypeAny>(schema: T): z.infer<T> {
  const envMappings = traverseSchema(schema);

  const configObject: any = {};

  for (const [path, subSchema] of envMappings) {
    const envVarName = getEnvVarName(subSchema);
    if (!envVarName) continue;

    const envValue = process.env[envVarName];

    let parsedValue: any = envValue === undefined ? undefined : envValue;

    // Set the parsed value in the config object
    let current = configObject;
    for (let i = 0; i < path.length; i++) {
      const key = path[i];
      if (i === path.length - 1) {
        current[key] = parsedValue;
      } else {
        current[key] = current[key] || {};
        current = current[key];
      }
    }
  }

  // Validate and parse the configuration
  try {
    const parsedConfig = schema.parse(configObject) as z.infer<T>;
    return parsedConfig;
  } catch (error: any) {
    if (error instanceof ZodError) {
      const errorMessages = error.errors
        .map((issue) => {
          const path = issue.path.join(".");
          let message = issue.message;

          switch (issue.code) {
            case "invalid_type":
              message = `Expected ${issue.expected}, received ${issue.received}`;
              break;
            case "invalid_string":
              if (issue.validation === "url") {
                message = "Must be a valid URL";
              }
              break;
          }

          return `- ${path}: ${message}`;
        })
        .join("\n");

      throw new Error(`Configuration validation failed:\n${errorMessages}`);
    } else {
      throw error;
    }
  }
}
