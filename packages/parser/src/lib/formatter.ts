import { QueryResult } from './query-result.js';
import chalk from 'chalk';

export function printQueryResultAsTable(
  queryResult: QueryResult,
  maxColumns = 6,
  maxRows = 100
): void {
  const { results, total, selection } = queryResult;
  const normalizedSelection =
    selection.length === 1 && selection[0] === '*'
      ? Object.keys(results[0] || {})
      : selection;

  if (results.length === 0) {
    console.log(chalk.yellow('No results found.'));
  }

  console.table(
    results
      .filter((_, index) => index < maxRows)
      .map((result) => {
        const formatted: Record<string, string> = {};
        normalizedSelection.forEach((key) => {
          if (key in result) {
            const value = result[key];
            if (typeof value === 'string' && value.length > 50) {
              formatted[key] = capString(value, 50);
            } else if (Array.isArray(value)) {
              formatted[key] = capString(value.join(', '), 50);
            } else {
              formatted[key] = String(value);
            }
          }
        });

        let normalized: Record<string, string> = formatted;
        const exceedsMaxColumns = Object.keys(formatted).length > maxColumns;
        if (exceedsMaxColumns) {
          normalized = Object.entries(formatted)
            .filter((_, index) => index < maxColumns)
            .reduce((acc, [key, value]) => {
              acc[key] = value;
              return acc;
            }, {} as Record<string, string>);
          normalized['...'] = '...';
        }

        return normalized;
      })
  );

  console.log(`Total results: ${chalk.green(total)}`);
}

function capString(str: string, maxLength: number): string {
  if (str.length > maxLength) {
    return str.slice(0, maxLength) + '...';
  }
  return str;
}
