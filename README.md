## Introduction
`node-config` is a configuration management library for Node.js applications written in TypeScript. It allows developers to define their configuration schemas using a fluent API, load environment variables, validate them, and map them to strongly-typed configuration objects. Under the hood, it leverages the power of Zod for schema definitions and validation.

## Features
* Strongly-Typed Configuration: Define your configuration schemas with TypeScript types for full type safety.
* Environment Variable Mapping: Easily map environment variables to configuration properties.
* Validation: Automatically validate configuration values against your schema.
* Customizable Error Messages: Provide user-friendly error messages for configuration issues.
* Support for Various Schema Types: Includes support for strings, numbers, booleans, enums, arrays, objects, dates, and more.
* No Need to Install Zod Directly: All necessary schema types and methods are exposed through the package.


## Installation
```sh
npm install node-config
```


## Getting Started
### Defining Configuration Schemas
Use the schema object provided by node-config to define your configuration schema. Each property in your configuration can be mapped to an environment variable using the .env() method.

**Example:**
* `schema.string()`: Defines a string schema.
* `.min(1)`: Adds a minimum length validation.
* `.env('APP_NAME')`: Maps the APP_NAME environment variable to this property.
* `.default(3000)`: Sets a default value if the environment variable is not provided.
* `schema.boolean()`: Defines a boolean schema.

```js
import { schema, TypeOf } from 'node-config';

const AppConfigSchema = schema.object({
  appName: schema.string().min(1).env('APP_NAME'),
  port: schema.number().int().positive().default(3000).env('PORT'),
  debugMode: schema.boolean().default(false).env('DEBUG_MODE'),
});

export type AppConfig = TypeOf<typeof AppConfigSchema>;

```


## Loading Configuration
Use the loadConfig function to load and validate your configuration based on the schema.

**Example:**

```js
// src/index.ts

import 'dotenv/config';
import { loadConfig } from 'node-config';
import { AppConfigSchema, AppConfig } from './config';

try {
  const config: AppConfig = loadConfig(AppConfigSchema);

  // Use the configuration
  console.log('App Name:', config.appName);
  console.log('Port:', config.port);
  console.log('Debug Mode:', config.debugMode);
} catch (error) {
  console.error(error.message);
  process.exit(1);
}

```



## API Reference
### Schema Types
The schema object provides methods to create various schema types:

* `string()`: Creates a string schema.
* `number()`: Creates a number schema.
* `boolean()`: Creates a boolean schema.
* `date()`: Creates a date schema.
* `enum(values)`: Creates an enum schema.
* `array(schema)`: Creates an array schema.
* `object(shape)`: Creates an object schema.
* `literal(value)`: Creates a literal schema.
* `union(schemas)`: Creates a union schema.
* `record(valueType)`: Creates a record schema.
* `any()`: Creates an any-type schema.
* `unknown()`: Creates an unknown-type schema.

### Methods
Each schema type supports chaining of validation methods provided:

* `.min(value)`: Sets the minimum value or length.
* `.max(value)`: Sets the maximum value or length.
* `.default(value)`: Sets a default value if none is provided.
* `.optional()`: Marks the field as optional.
* `.nullable()`: Allows the field to be null.
* `.env(variableName)`: Maps the schema to an environment variable.

### Utility Types
* `TypeOf<T>`: Extracts the TypeScript type from a schema