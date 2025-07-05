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
  .description('Runs a query against the NxDB database')
  .action(async (queryFile) => {
    const queryParser = QueryParser.getInstance();
    try {
      const query = queryParser.parseQueryFromFile(queryFile);
      writeFileSync('tmp/query.json', JSON.stringify(query, null, 2));
      console.log('Query saved to tmp/query.json');
    } catch (error) {
      console.error('Error parsing query:', error);
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
