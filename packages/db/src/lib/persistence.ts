import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { Primitive } from './utils/get-custom-fields.js';
import { ProjectsMap } from './project.js';
import chalk from 'chalk';

export type CustomFieldsPerProject = Record<string, Record<string, Primitive>>;

export function writeDatabase(projectMap: ProjectsMap) {
  const dbDirPath = resolve('.nxdb');
  if (!existsSync(dbDirPath)) {
    mkdirSync(dbDirPath, { recursive: true });
  }

  writeFileSync(
    resolve(dbDirPath, 'projects.json'),
    JSON.stringify(projectMap, null, 2)
  );

  console.log(`${chalk.green('✔')} Database has beeen successfully persisted.`);
}

export function readDatabase(): { projects: ProjectsMap } {
  const dbDirPath = resolve('.nxdb');
  const projectsFilePath = resolve(dbDirPath, 'projects.json');

  if (!existsSync(projectsFilePath)) {
    throw new Error(`Database file not found at ${projectsFilePath}`);
  }

  const projectsData = readFileSync(projectsFilePath, 'utf-8');
  return {
    projects: JSON.parse(projectsData) as ProjectsMap,
  };
}
