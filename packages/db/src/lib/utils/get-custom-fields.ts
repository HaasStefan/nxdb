import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

export type Primitive = string | number | boolean | string[] | number[] | boolean[];

interface ESModule {
  default?: unknown;
};

export async function getCustomFieldsAsync(projectRoot: string): Promise<Record<string, Primitive>> {
  const nxdbConfigPathMjs = resolve(projectRoot, '.nxdb.config.mjs');
  const nxdbConfigPathJs = resolve(projectRoot, '.nxdb.config.js');

  if (!existsSync(nxdbConfigPathMjs) && !existsSync(nxdbConfigPathJs)) {
    console.debug(`No custom fields configuration found in ${projectRoot}.`);
    return {};
  }

  const configPath = existsSync(nxdbConfigPathMjs) ? nxdbConfigPathMjs : nxdbConfigPathJs;
  const configUrl = pathToFileURL(configPath).href;

  const module = await import(configUrl);
  if (!isESModule(module)) {
    throw new Error(`Invalid custom fields configuration in ${configPath}. Expected an ES module.`);
  }

  const { default: fn } = module;

  if (typeof fn !== 'function') {
    throw new Error(`Invalid custom fields configuration in ${configPath}. Expected a function.`);
  }

  const customFields = await fn();

  if (typeof customFields !== 'object' || customFields === null) {
    throw new Error(`Invalid custom fields configuration in ${configPath}. Expected an object.`);
  }

  const result: Record<string, Primitive> = {};
  for (const [key, value] of Object.entries(customFields)) {
    if (isPrimitive(value)) {
      result[key] = value;
    } else {
      throw new Error(`Invalid custom field value for "${key}" in ${configPath}. Expected a primitive type.`);
    }
  }

  return result;
}

function isESModule(value: unknown): value is ESModule {
  return typeof value === 'object' && value !== null && 'default' in value;
}

function isPrimitive(value: unknown): value is Primitive {
  return (
    typeof value === 'string' ||
    typeof value === 'number' ||
    typeof value === 'boolean' ||
    Array.isArray(value) && value.every(item => typeof item === 'string' || typeof item === 'number' || typeof item === 'boolean')
  );
}