import ora from 'ora';
import chalk from 'chalk';
import { type ProjectGraph, readCachedProjectGraph } from '@nx/devkit';
import { execAsync } from './utils/exec-async.js';
import { getCustomFieldsAsync } from './utils/get-custom-fields.js';
import type { Project, ProjectsMap } from './project.js';
import { writeDatabase } from './persistence.js';

export async function buildDatabaseAsync() {
  const projectGraph = await generateNxProjectGraphAsync();
  const projectsMap = await getProjectsMapAsync(projectGraph);

  writeDatabase(projectsMap);
}

async function getProjectsMapAsync(
  projectGraph: ProjectGraph
): Promise<ProjectsMap> {
  const spinner = ora('Generating DB...').start();

  try {
    const projectRootMap = createProjectRootMap(projectGraph);
    const projectsMap: ProjectsMap = {};

    for (const [projectName, projectRoot] of projectRootMap.entries()) {
      const customFields = await getCustomFieldsAsync(projectRoot);
      const dependencies = (
        Object.values(projectGraph.dependencies[projectName]) ?? []
      )
        .filter(({ target }) => !target.startsWith('npm:'))
        .map(({ target }) => target);

      const dependedByProjects = Object.keys(projectGraph.dependencies)
        .filter((key) =>
          projectGraph.dependencies[key]?.some(
            ({ target }) => target === projectName
          )
        )
        .map((key) => key);

      const targetNames = Object.keys(
        projectGraph.nodes[projectName]?.data?.targets || {}
      );

      const tags = projectGraph.nodes[projectName]?.data?.tags || [];

      const project: Project = {
        name: projectName,
        root: projectRoot,
        customFields,
        tags,
        targetNames,
        dependencies,
        dependedByProjects,
      };

      projectsMap[projectName] = project;
    }

    spinner.succeed(chalk.green('Database was successfully generated!'));
    return projectsMap;
  } catch (error) {
    spinner.fail(chalk.red('Failed to generate DB.'));
    throw error;
  }
}

async function generateNxProjectGraphAsync() {
  const spinner = ora('Generating Nx Project Graph...').start();

  try {
    const projectGraph = await getFreshProjectGraphAsync();
    spinner.succeed(chalk.green('Nx Project Graph generated successfully!'));
    return projectGraph;
  } catch (error) {
    spinner.fail(chalk.red('Failed to generate Nx Project Graph.'));
    throw error;
  }
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
