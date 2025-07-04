import ora from 'ora';
import chalk from 'chalk';
import { type ProjectGraph, readCachedProjectGraph } from '@nx/devkit';
import { execAsync } from './utils/exec-async.js';
import { getCustomFieldsAsync } from './utils/get-custom-fields.js';

export async function buildDatabaseAsync() {
  await generateNxProjectGraphAsync();
}

async function generateNxProjectGraphAsync() {
  const spinner = ora('Generating Nx Project Graph...').start();

  try {
    const projectGraph = await getFreshProjectGraphAsync();
    const projectRootMap = createProjectRootMap(projectGraph);
    
    for (const [projectName, projectRoot] of projectRootMap.entries()) {
      const customFields = await getCustomFieldsAsync(projectRoot);

      console.log(chalk.blue(`Project: ${projectName}`));
      console.log(chalk.green(`Root: ${projectRoot}`));
      if (Object.keys(customFields).length > 0) {
        console.log(chalk.yellow('Custom Fields:'));
        for (const [key, value] of Object.entries(customFields)) {
          console.log(chalk.cyan(`  ${key}: ${JSON.stringify(value)}`));
        }
      }
      console.log(''); // Add a blank line for better readability
    }
    
    
  } catch (error) {
    spinner.fail(chalk.red('Failed to generate Nx Project Graph.'));
    throw error;
  }

  spinner.succeed(chalk.green('Nx Project Graph generated successfully!'));
}

/**
 * @param projectGraph The Nx Project Graph object.
 * @returns a Map, key: project name, value: project root.
 */
function createProjectRootMap(projectGraph: ProjectGraph): Map<string, string> {
  const projectRootMap = new Map();
  for (const [projectName, project] of Object.entries(projectGraph.nodes)) {
    projectRootMap.set(projectName, project.data.root);
  }
  return projectRootMap;
}

async function getFreshProjectGraphAsync(): Promise<ProjectGraph> {
    await execAsync('nx reset');
    await execAsync('nx graph --file=tmp/graph.json'); // Doing it like this to avoid terminal output pollution
    await execAsync('rm -rf tmp/graph.json'); // Clean up the temporary file
    return readCachedProjectGraph();
}