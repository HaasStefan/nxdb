import type { Project } from '@nxdb/db';
import type { QueryResult } from './query-result.js';

export function normalizeProject(project: Project): QueryResult {
  const normalized: QueryResult = {
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
  project: QueryResult,
  selection: string[]
): Partial<QueryResult> {
  if (selection.length === 1 && selection[0] === '*') {
    return project;
  }

  const result: Partial<QueryResult> = {};
  selection.forEach((key) => {
    if (key in selection) {
      result[key] = project[key];
    }
  });

  return result;
}