import { getNumberOfCommitsAsync } from './tools/number-of-commits.mjs';
import { getLinesOfCode } from './tools/lines-of-code.mjs';

export default async function (projectRoot) {
  const numberOfCommits = await getNumberOfCommitsAsync(projectRoot);
  const {
    totalLinesOfCode,
    htmlLinesOfCode,
    jsLinesOfCode,
    tsLinesOfCode,
    cssLinesOfCode,
    jsonLinesOfCode,
    mdLinesOfCode,
    tsxLinesOfCode,
    scssLinesOfCode,
    lessLinesOfCode,
    numberOfFiles,
  } = getLinesOfCode(projectRoot, [
    'node_modules',
    'dist',
    'build',
    'coverage',
    'out',
    'tmp',
    'temp',
    'obj',
    'bin',
  ]);

  return {
    numberOfCommits,
    totalLinesOfCode,
    htmlLinesOfCode,
    jsLinesOfCode,
    tsLinesOfCode,
    cssLinesOfCode,
    jsonLinesOfCode,
    mdLinesOfCode,
    tsxLinesOfCode,
    scssLinesOfCode,
    lessLinesOfCode,
    numberOfFiles,
  };
}
