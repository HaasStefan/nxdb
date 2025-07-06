import { program } from 'commander';
import {
  buildDatabaseAsync,
  initializeDatabaseAsync,
  printSchema,
  readSchema,
  resetDatabaseAsync,
} from '@nxdb/db';
import { QueryParser } from '@nxdb/parser';
import { writeFileSync } from 'node:fs';
import chalk from 'chalk';

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

// todo: add file option to write to a file instead of console output
program
  .command('query <queryFile>')
  .option('-o, --outputFile <file>', 'File to write the query result to')
  .description('Runs a query against the NxDB database')
  .action(async (queryFile, options) => {
    const { outputFile } = options;
    const queryParser = QueryParser.getInstance();
    try {
      const query = queryParser.parseQueryFromFile(queryFile);
      // todo run the query against the database
      // const result = await runQueryAsync(query);
      // For now, just log the query to the console

      if (outputFile) {
        writeFileSync(outputFile, JSON.stringify(query, null, 2));
        console.log(
          `${chalk.green('✔')} Query result written to ${outputFile}.`
        );
      } else {
        console.log(chalk.blue('Query result:'));
        console.log(JSON.stringify(query, null, 2));
      }
    } catch (error) {
      console.error(chalk.red(`Error parsing query from file: ${queryFile}`));
      console.error(error instanceof Error ? error.message : error);
      process.exit(1);
    }
  });

// todo: add interactive mode which allows users to run queries without needing to write them in a file
// command should not be unnamed
program
  .command('')
  .description('Runs an interactive query session')
  .action(() => {
    // todo: implement interactive mode
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
