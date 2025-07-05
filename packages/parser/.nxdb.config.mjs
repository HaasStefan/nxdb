
import baseFnAsync from '../../.nxdb.config.base.mjs';
import { resolve } from 'node:path';

export default async function () {
  const projectRoot = resolve(import.meta.dirname);
  const baseCustomFields = await baseFnAsync(projectRoot);

  return {
    ...baseCustomFields
  };
}
