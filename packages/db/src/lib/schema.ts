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
