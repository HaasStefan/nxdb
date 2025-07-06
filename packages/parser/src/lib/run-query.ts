import type { ComparisonExpression, Query } from './parser/parser.js';
import { readDatabaseAsync, type ProjectsMap } from '@nxdb/db';
import type { QueryResult, Result } from './query-result.js';
import { normalizeProject, omitBySelection } from './normalize-project.js';
import { normalizeSelection } from './normalize-selection.js';

/**
 * Runs a query against the database and returns the results.
 *
 * @param query - The query to run.
 * @returns An array of query results.
 * @throws Will throw an error if the source is not 'projects' or if the selection type is not supported.
 */
export async function runQueryAsync(query: Query): Promise<QueryResult> {
  const { selection, source, condition } = query;
  const { projects } = await readDatabaseAsync();
  const results: Result[] = [];

  if (source !== 'projects') {
    throw new Error(
      `Unsupported source: ${source}. Currently only 'projects' is supported.`
    );
  }

  if (selection.type !== 'All' && typeof selection.type !== 'string') {
    throw new Error(
      `Unsupported selection type: ${selection.type}. Currently only '*' is supported.`
    );
  }

  const normalizedSelection = normalizeSelection(selection);

  if (condition) {
    const shouldAccessByKey =
      condition.type === 'ComparisonExpression' &&
      condition.operator === '=' &&
      condition.left === 'name';
    if (shouldAccessByKey) {
      const results = handleNameEqualComparisonExpression(projects, condition).map(
        (project) => omitBySelection(project, normalizedSelection)
      );

      return {
        results,
        total: results.length,
        selection: normalizedSelection,
      };
    }
  }

  const normalizedResults = results.map((result) =>
    omitBySelection(result, normalizedSelection)
  );
  return {
    results: normalizedResults,
    total: normalizedResults.length,
    selection: normalizedSelection,
  };
}

/**
 * Handles a comparison expression where the left side is 'name' and the operator is '='.
 * It retrieves the project with the specified name from the projects map.
 *
 * @param projects - The map of projects.
 * @param comparisonExpression - The comparison expression to evaluate.
 * @returns An array of query results containing the project if found. Length will be 0 if not found or 1 if found.
 * @throws Will throw an error if the right side of the expression is not a string.
 */
function handleNameEqualComparisonExpression(
  projects: ProjectsMap,
  comparisonExpression: ComparisonExpression
) {
  const results: Result[] = [];
  const projectName = comparisonExpression.right;
  if (typeof projectName !== 'string') {
    throw new Error(
      `Invalid condition right value: ${comparisonExpression.right}. Expected a string.`
    );
  }

  if (projectName in projects) {
    const project = projects[projectName];
    const queryResult = normalizeProject(project);
    results.push(queryResult);
  }

  return results;
}
