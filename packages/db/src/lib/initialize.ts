import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { buildDatabaseAsync } from './builder.js';
import chalk from 'chalk';

export async function initializeDatabaseAsync(): Promise<void> {
  const gitignore = resolve('.gitignore');

  if (!existsSync(gitignore)) {
    writeFileSync(gitignore, '.nxdb\n');
    console.log(`${chalk.green('✔')} Created .gitignore file to ignore .nxdb directory.`);
  } else {
    const gitignoreContent = readFileSync(gitignore, 'utf-8');
    if (!gitignoreContent.includes('.nxdb')) {
      writeFileSync(
        gitignore,
        `${gitignoreContent}\n# Ignores NxDB:\n.nxdb\n`
      );
      console.log(`${chalk.green('✔')} Updated .gitignore file to ignore .nxdb directory.`);
    } else {
      console.warn(`${chalk.yellow('ℹ️ .gitignore already contains .nxdb, no changes made.')}`);
    }
  }

  await buildDatabaseAsync();

  console.log(`${chalk.green('✔')} NxDB has been successfully initialized!`);
}
