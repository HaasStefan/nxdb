import type { Project } from '@nx-db/db';
import type { Result } from './query-result.js';

export function normalizeProject(project: Project): Result {
  const normalized: Result = {
    name: project.name,
    type: project.type,
    tags: project.tags,
    root: project.root,
    sourceRoot: project.sourceRoot || 'undefined',
    targets: project.targets,
    implicitDependencies: project.implicitDependencies,
    dependencies: project.dependencies,
  };

  if (project.customFields) {
    Object.entries(project.customFields).forEach(([key, value]) => {
      normalized[key] = value;
    });
  }

  return normalized;
}

export function omitBySelection(
  project: Result,
  selection: string[]
): Partial<Result> {
  if (selection.length === 1 && selection[0] === '*') {
    return project;
  }

  const result: Partial<Result> = {};
  selection.forEach((key) => {
    if (key in project) {
      result[key] = project[key];
    } else {
      throw new Error(
        `Invalid selection key: ${key}. Available keys are: ${Object.keys(project).join(', ')}`
      );
    }
  });

  return result;
}