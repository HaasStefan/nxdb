import ora from 'ora';
import { execAsync } from './utils/exec-async.js';
import { resolve } from 'node:path';

export async function resetDatabaseAsync(): Promise<void> {
  const spinner = ora('Resetting database...').start();

  try {
    const dbDir = resolve('.nxdb');
    await execAsync(`rm -rf ${dbDir}`);
    spinner.succeed('Database was successfully reset!');
  } catch (error) {
    spinner.fail('Failed to reset the database.');
    throw error;
  }
}