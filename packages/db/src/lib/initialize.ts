import { existsSync, readFileSync, write, writeFileSync } from 'node:fs';
import { relative, resolve } from 'node:path';
import { buildDatabaseAsync, generateNxProjectGraphAsync } from './builder.js';
import chalk from 'chalk';
import { TemplateEngine } from './template-engine.js';

export async function initializeDatabaseAsync(): Promise<void> {
  const gitignore = resolve('.gitignore');

  if (!existsSync(gitignore)) {
    writeFileSync(gitignore, '.nxdb\n');
    console.log(
      `${chalk.green('✔')} Created .gitignore file to ignore .nxdb directory.`
    );
  } else {
    const gitignoreContent = readFileSync(gitignore, 'utf-8');
    if (!gitignoreContent.includes('.nxdb')) {
      writeFileSync(gitignore, `${gitignoreContent}\n# Ignores NxDB:\n.nxdb\n`);
      console.log(
        `${chalk.green('✔')} Updated .gitignore file to ignore .nxdb directory.`
      );
    } else {
      console.warn(
        `${chalk.yellow(
          'ℹ️ .gitignore already contains .nxdb, no changes made.'
        )}`
      );
    }
  }

  generateSchemaFile();

  await generateConfigFilesAsync();

  // skip graph computation because generateConfigFilesAsync already does it
  await buildDatabaseAsync({ skipGraphComputation: true });

  console.log(`${chalk.green('✔')} NxDB has been successfully initialized!`);
}

function generateSchemaFile() {
  const schemaFilePath = resolve('.nxdb.schema.json');
  if (existsSync(schemaFilePath)) {
    console.warn(
      `${chalk.yellow(
        '⚠️ .nxdb.schema.json already exists, skipping generation.'
      )}`
    );
  }

  writeFileSync(
    schemaFilePath,
    JSON.stringify(
      {
        someField: {
          type: 'string',
          description: 'Some field description',
          default: 'Hello World',
        },
      },
      null,
      2
    ),
    'utf-8'
  );

  console.log(
    `${chalk.green('✔')} Generated .nxdb.schema.json in workspace root.`
  );
}

async function generateConfigFilesAsync(): Promise<void> {
  const projectGraph = await generateNxProjectGraphAsync();
  const projectRoots = Object.values(projectGraph.nodes).map(
    (node) => node.data.root
  );

  const wasBaseConfigGenerated = generateBaseConfig();

  if (wasBaseConfigGenerated) {
    console.log(
      `${chalk.green('✔')} Generated .nxdb.config.base.mjs in workspace root.`
    );
  }

  let wasAtLeastOneProjectConfigGenerated = false;
  for (const projectRoot of projectRoots) {
    const wasProjectConfigGenerated = generateProjectConfig(projectRoot);
    wasAtLeastOneProjectConfigGenerated =
      wasAtLeastOneProjectConfigGenerated || wasProjectConfigGenerated;
  }

  if (wasAtLeastOneProjectConfigGenerated) {
    console.log(`${chalk.green('✔')} Generated .nxdb.config.mjs for projects.`);
  }
}

function generateProjectConfig(projectRoot: string) {
  if (existsSync(resolve(projectRoot, '.nxdb.config.mjs'))) {
    console.warn(
      `${chalk.yellow(
        `⚠️ .nxdb.config.mjs already exists in ${projectRoot}, skipping generation.`
      )}`
    );
    return false;
  }

  const baseConfigPath = resolve('.nxdb.config.base.mjs');
  const relativeConfigPath = relative(projectRoot, baseConfigPath);
  const templateEngine = TemplateEngine.getInstance();
  const template = templateEngine.getFile('.nxdb.config.mjs', {
    relativeBaseConfigPath: relativeConfigPath,
  });
  writeFileSync(resolve(projectRoot, '.nxdb.config.mjs'), template, 'utf-8');

  return true;
}

function generateBaseConfig() {
  if (existsSync(resolve('.nxdb.config.base.mjs'))) {
    console.warn(
      `${chalk.yellow(
        '⚠️ .nxdb.config.base.mjs already exists, skipping generation.'
      )}`
    );
    return false;
  }

  const templateEngine = TemplateEngine.getInstance();
  const template = templateEngine.getFile('.nxdb.config.base.mjs', {});
  writeFileSync(resolve('.nxdb.config.base.mjs'), template, 'utf-8');

  return true;
}
