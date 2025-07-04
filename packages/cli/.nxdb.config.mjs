import { resolve } from "path";
import { getChurnRateAsync } from "../../tools/churn-rate.mjs";
import { getLinesOfCode } from "../../tools/lines-of-code.mjs";

export default async function () {
  const projectRoot = resolve(import.meta.dirname);
  const churnRate = await getChurnRateAsync(projectRoot);
  const {
    totalLines,
    htmlLines,
    jsLines,
    tsLines,
    cssLines,
    jsonLines,
    mdLines,
    numberOfFiles
  } = getLinesOfCode(projectRoot, [
    'node_modules',
    'dist',
    'build',
    'coverage',
    'out',
    'tmp',
    'temp',
    'obj',
    'bin'
  ]);

  return {
    churnRate,
    totalLines,
    htmlLines,
    jsLines,
    tsLines,
    cssLines,
    jsonLines,
    mdLines,
    numberOfFiles
  };
}