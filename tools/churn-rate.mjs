import { execAsync } from './exec-async.mjs';

export async function getChurnRateAsync(
  projectRoot
) {
  const { stdout } = await execAsync(
    `git log --since="30 days ago" --pretty=oneline -- ${projectRoot}`
  );

  const commits = stdout.split('\n').filter(line => line.trim() !== '');
  const churnRate = commits.length;
  console.log(`Churn rate for project at ${projectRoot}: ${churnRate} commits in the last 30 days.`);
  return churnRate;
}


