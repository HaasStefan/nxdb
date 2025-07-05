import { resolve } from 'path';
import baseFnAsync from '../../.nxdb.config.base.mjs';

export default async function () {
  await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulate async operation

  const projectRoot = resolve(import.meta.dirname);
  const baseCustomFields = await baseFnAsync(projectRoot);

  return {
    ...baseCustomFields,
  };
}
