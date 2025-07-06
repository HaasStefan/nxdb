import { program } from 'commander';
import {
  buildDatabaseAsync,
  initializeDatabaseAsync,
  printSchema,
  readSchema,
  resetDatabaseAsync,
} from '@nxdb/db';
import { printQueryResultAsTable, QueryParser, runQuery } from '@nxdb/parser';
import { writeFileSync } from 'node:fs';
import chalk from 'chalk';
import prompts from 'prompts';

program
  .name('nxdb')
  .description(
    'Turns your Nx Project Graph into a database which you can query with a simplified query language'
  )
  .version('1.0.0');

program.command('build').action(async (options) => {
  await buildDatabaseAsync();
});

program
  .command('reset')
  .description('Resets the NxDB database')
  .action(async () => {
    await resetDatabaseAsync();
  });

program
  .command('query <queryFile>')
  .option('-o, --outputFile <file>', 'File to write the query result to')
  .option(
    '-c, --maxColumns <number>',
    'Maximum number of columns in the output table',
    '6'
  )
  .option(
    '-r, --maxRows <number>',
    'Maximum number of rows in the output table',
    '100'
  )
  .description('Runs a query against the NxDB database')
  .action(async (queryFile, options) => {
    const { outputFile, maxColumns, maxRows } = options;
    const queryParser = QueryParser.getInstance();
    try {
      const query = queryParser.parseQueryFromFile(queryFile);
      const results = runQuery(query);

      if (outputFile) {
        writeFileSync(outputFile, JSON.stringify(results, null, 2));
        console.log(
          `${chalk.green('✔')} Query result written to ${outputFile}.`
        );
      } else {
        printQueryResultAsTable(
          results,
          parseInt(maxColumns, 10),
          parseInt(maxRows, 10)
        );
      }
    } catch (error) {
      console.error(chalk.red(`Error parsing query from file: ${queryFile}`));
      console.error(error instanceof Error ? error.message : error);
      process.exit(1);
    }
  });

program.description('Runs an interactive query session').action(async () => {
  while (true) {
    const response = await prompts({
      type: 'text',
      name: 'query',
      message: 'Query:',
      validate: (value) => {
        if (value.trim() === '') {
          return 'Query cannot be empty';
        }
        return true;
      }
    }, { onCancel: () => {
      console.log(chalk.green('Exiting interactive mode.'));
      process.exit(0);
    }});

    const queryFromPrompt = response.query.trim();
    if (queryFromPrompt.toLowerCase() === 'exit' || queryFromPrompt.toLowerCase() === 'stop' || queryFromPrompt.toLowerCase() === 'quit') {
      console.log(chalk.green('Exiting interactive mode.'));
      process.exit(0);
    }

    try {
      const queryParser = QueryParser.getInstance();
      const query = queryParser.parseFromQuery(queryFromPrompt);
      const results = runQuery(query);

      if (results.total === 0) {
        console.log(chalk.yellow('No results found.'));
      } else {
        printQueryResultAsTable(results, parseInt(process.env.MAX_COLUMNS || '6', 10), parseInt(process.env.MAX_ROWS || '20', 10));
      }
    } catch {
      console.error(chalk.red('Error running query!'));
    }
  }
});

program
  .command('init')
  .description('Initializes the repo for NxDB usage')
  .action(async () => {
    await initializeDatabaseAsync();
  });

program
  .command('schema')
  .description('Prints the schema of the NxDB database')
  .action(() => {
    const schema = readSchema();
    printSchema(schema);
  });

program.parse(process.argv);
