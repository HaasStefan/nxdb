import { execAsync } from './exec-async.mjs';

export async function getNumberOfCommitsAsync(projectRoot) {
  const { stdout } = await execAsync(
    `git log --since="30 days ago" --pretty=oneline -- ${projectRoot}`
  );

  const commits = stdout.split('\n').filter((line) => line.trim() !== '');
  const numberOfCommits = commits.length;
  return numberOfCommits;
}
