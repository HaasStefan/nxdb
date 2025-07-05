import { resolve } from 'node:path';
import { Primitive } from './utils/get-custom-fields.js';
import { readFileSync } from 'node:fs';
import chalk from 'chalk';

type SchemaType =
  | 'string'
  | 'number'
  | 'boolean'
  | 'string[]'
  | 'number[]'
  | 'boolean[]';

export interface Schema {
  [key: string]: {
    type: SchemaType;
    description: string;
    default: Primitive;
  };
}

/**
 * Reserved field names that are not allowed to be used as custom fields.
 * These fields are reserved for internal use by NxDB.
 */
const reservedFieldNames = [
  'name',
  'root',
  'customFields',
  'tags',
  'targetNames',
  'dependencies',
  'dependedByProjects',
] as const;

/**
 * Singleton class to manage the NxDB schema.
 * It reads the schema from a JSON file and provides methods to access and validate it.
 */
export class SchemaManager {
  private readonly schema: Schema;
  private static instance: SchemaManager;

  private constructor() {
    this.schema = readSchema();
  }

  static getInstance(): SchemaManager {
    if (!SchemaManager.instance) {
      SchemaManager.instance = new SchemaManager();
    }
    return SchemaManager.instance;
  }

  getSchema(): Schema {
    return this.schema as Readonly<Schema>;
  }

  getEntry(
    key: string
  ): { type: SchemaType; description: string; default: Primitive } | undefined {
    return this.schema[key];
  }

  getDefaultValue(key: string): Primitive | undefined {
    return this.schema[key]?.default;
  }

  getMissingKeyValuePairs(fields: object) {
    const missingPairs: Record<string, Primitive> = {};
    for (const [key, value] of Object.entries(this.schema)) {
      if (!(key in fields)) {
        missingPairs[key] = value.default;
      }
    }
    return missingPairs;
  }

  validateFields(
    fields: Record<string, unknown>
  ): Record<string, Primitive> {
    const validFields = {...fields};
    for (const [key, value] of Object.entries(fields)) {
      const schemaEntry = this.schema[key];
      if (!schemaEntry) {
        throw new Error(`Unknown field "${key}" in fields.`);
      }

      const { type, default: defaultValue } = schemaEntry;

      if (typeof value !== type && !Array.isArray(value)) {
        throw new Error(
          `Field "${key}" should be of type "${type}", but received "${typeof value}".`
        );
      }

      if (Array.isArray(value)) {
        if (
          (type === 'string[]' && !value.every((v) => typeof v === 'string')) ||
          (type === 'number[]' && !value.every((v) => typeof v === 'number')) ||
          (type === 'boolean[]' && !value.every((v) => typeof v === 'boolean'))
        ) {
          throw new Error(
            `Field "${key}" should be an array of ${type.replace('[]', '')}, but received an array of ${typeof value[0]}.`
          );
        }
      } else if (value === undefined) {
        validFields[key] = defaultValue;
      }
    }

    const missingPairs = this.getMissingKeyValuePairs(validFields);
    for (const [key, defaultValue] of Object.entries(missingPairs)) {
      if (validFields[key] === undefined) {
        validFields[key] = defaultValue;
      }
    }

    return validFields as Record<string, Primitive>; 
  }
}

export function readSchema(): Schema {
  const schemaJson = resolve('.nxdb.schema.json');
  try {
    const schema = readFileSync(schemaJson, 'utf-8');
    const parsedSchema: Schema = JSON.parse(schema);

    if (typeof parsedSchema !== 'object' || parsedSchema === null) {
      throw new Error(
        `Invalid schema format in ${schemaJson}. Expected an object.`
      );
    }

    for (const [key, value] of Object.entries(parsedSchema)) {
      if (reservedFieldNames.includes(key as typeof reservedFieldNames[number])) {
        throw new Error(
          `Field "${key}" is reserved and cannot be used in the schema.`
        );
      }
      
      if (typeof value !== 'object' || value === null) {
        throw new Error(
          `Invalid schema entry for "${key}" in ${schemaJson}. Expected an object.`
        );
      }
      if (
        value.type === undefined ||
        value.description === undefined ||
        value.default === undefined
      ) {
        throw new Error(
          `Missing required fields in schema entry for "${key}" in ${schemaJson}.`
        );
      }
      if (
        ![
          'string',
          'number',
          'boolean',
          'string[]',
          'number[]',
          'boolean[]',
        ].includes(value.type)
      ) {
        throw new Error(
          `Invalid type "${value.type}" for "${key}" in ${schemaJson}.`
        );
      }
      if (value.type === 'string' && typeof value.default !== 'string') {
        throw new Error(
          `Default value for "${key}" must be a string in ${schemaJson}.`
        );
      }
      if (value.type === 'number' && typeof value.default !== 'number') {
        throw new Error(
          `Default value for "${key}" must be a number in ${schemaJson}.`
        );
      }
      if (value.type === 'boolean' && typeof value.default !== 'boolean') {
        throw new Error(
          `Default value for "${key}" must be a boolean in ${schemaJson}.`
        );
      }
      if (
        (value.type === 'string[]' && !Array.isArray(value.default)) ||
        (Array.isArray(value.default) &&
          (value.default as unknown[]).some((item) => typeof item !== 'string'))
      ) {
        throw new Error(
          `Default value for "${key}" must be an array of strings in ${schemaJson}.`
        );
      }
      if (
        (value.type === 'number[]' && !Array.isArray(value.default)) ||
        (Array.isArray(value.default) &&
          (value.default as unknown[]).some((item) => typeof item !== 'number'))
      ) {
        throw new Error(
          `Default value for "${key}" must be an array of numbers in ${schemaJson}.`
        );
      }
      if (
        (value.type === 'boolean[]' && !Array.isArray(value.default)) ||
        (Array.isArray(value.default) &&
          (value.default as unknown[]).some(
            (item) => typeof item !== 'boolean'
          ))
      ) {
        throw new Error(
          `Default value for "${key}" must be an array of booleans in ${schemaJson}.`
        );
      }
    }

    return parsedSchema;
  } catch (error) {
    console.error(`Error reading schema file at ${schemaJson}:`, error);
    throw error;
  }
}

export function printSchema(schema: Schema): void {
  console.log(chalk.blue('NxDB Schema:'));
  console.log('');
  console.log(
    chalk.gray('This schema defines the structure of the NxDB database.')
  );
  console.log(
    chalk.gray('Each entry includes the type, description, and default value.')
  );
  console.log(
    chalk.gray(
      'The types can be: string, number, boolean, string[], number[], boolean[].'
    )
  );
  console.log(chalk.gray('You can find the schema file at /.nxdb.schema.json'));
  console.log('');

  console.log(
    '------------------------------------------------------------------------------------------'
  );
  for (const [key, value] of Object.entries(schema)) {
    console.log(chalk.green(`- ${key}:`));
    console.log(chalk.gray(`\tDescription: ${value.description}`));
    console.log(chalk.yellow(`\tType: ${value.type}`));
    console.log(chalk.magenta(`\tDefault: ${JSON.stringify(value.default)}`));
    console.log(
      '------------------------------------------------------------------------------------------'
    );
  }
}
