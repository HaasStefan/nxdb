import type { ComparisonExpression, Query } from './parser/parser.js';
import {
  flattenProject,
  Primitive,
  readDatabaseAsync,
  type ProjectsMap,
} from '@nx-db/db';
import type { QueryResult, Result } from './query-result.js';
import { normalizeProject, omitBySelection } from './normalize-project.js';
import { normalizeSelection } from './normalize-selection.js';
import ora from 'ora';

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

  if (selection.type !== 'All' && selection.type !== 'List') {
    throw new Error(
      `Unsupported selection type: ${selection.type}. Currently only '*' is supported.`
    );
  }

  const spinner = ora(`Running query...`).start();
  try {
    const normalizedSelection = normalizeSelection(selection);

    if (condition) {
      const shouldAccessByKey =
        condition.type === 'ComparisonExpression' &&
        condition.operator === '=' &&
        condition.left === 'name';
      if (shouldAccessByKey) {
        const results = handleNameEqualComparisonExpression(
          projects,
          condition
        ).map((project) => omitBySelection(project, normalizedSelection));

        spinner.succeed('Query executed successfully.');
        return {
          results,
          total: results.length,
          selection: normalizedSelection,
        };
      } else {
        let results: Partial<Result>[] = [];
        switch (condition.type) {
          case 'ComparisonExpression':
            results = handleComparisonExpression(
              projects,
              condition as ComparisonExpression
            ).map((project) => omitBySelection(project, normalizedSelection));
            spinner.succeed('Query executed successfully.');
            return {
              results,
              total: results.length,
              selection: normalizedSelection,
            };
          default:
            throw new Error(
              `Unsupported condition type: ${condition.type}. Currently only 'ComparisonExpression' is supported.`
            );
        }
      }
    } else {
      // If no condition is specified, return all projects
      results.push(
        ...Object.values(projects).map(
          (project) => normalizeProject(project),
          normalizedSelection
        )
      );
    }

    const normalizedResults = results.map((result) =>
      omitBySelection(result, normalizedSelection)
    );

    spinner.succeed('Query executed successfully.');
    return {
      results: normalizedResults,
      total: normalizedResults.length,
      selection: normalizedSelection,
    };
  } catch (error) {
    spinner.fail(`Error executing query!`);
    throw new Error(
      `Error executing query: ${error instanceof Error ? error.message : error}`
    );
  }
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

function handleComparisonExpression(
  projects: ProjectsMap,
  comparisonExpression: ComparisonExpression
): Result[] {
  const results: Result[] = [];
  const { left, operator, right } = comparisonExpression;

  for (const project of Object.values(projects)) {
    const normalizedProject = flattenProject(project);
    if (left in normalizedProject) {
      const leftValue = normalizedProject[left as keyof typeof project];
      let conditionMet = false;

      switch (operator) {
        case '=':
          conditionMet = leftValue === right;
          break;
        case '!=':
          conditionMet = leftValue !== right;
          break;
        case '<':
          throwIfNotNumberComparison(leftValue, right, operator);
          conditionMet = leftValue < right;
          break;
        case '>':
          throwIfNotNumberComparison(leftValue, right, operator);
          conditionMet = leftValue > right;
          break;
        case '<=':
          throwIfNotNumberComparison(leftValue, right, operator);
          conditionMet = leftValue <= right;
          break;
        case '>=':
          throwIfNotNumberComparison(leftValue, right, operator);
          conditionMet = leftValue >= right;
          break;
        default:
          throw new Error(`Unsupported operator: ${operator}`);
      }

      if (conditionMet) {
        results.push(normalizeProject(project));
      }
    } else {
      throw new Error(
        `Invalid condition left value: ${left}. Project does not have this field.`
      );
    }
  }

  return results;
}

function throwIfNotNumberComparison(
  leftValue: Primitive,
  rightValue: Primitive,
  operator: string
): leftValue is number & typeof rightValue {
  if (typeof leftValue !== 'number' || typeof rightValue !== 'number') {
    throw new Error(
      `Invalid comparison: ${leftValue} ${operator} ${rightValue}. Both sides must be numbers.`
    );
  }

  return true;
}
