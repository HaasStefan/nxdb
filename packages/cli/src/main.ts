import { program } from 'commander';
import { buildDatabaseAsync, printSchema, readSchema, resetDatabaseAsync } from '@nxdb/db';

program
  .name('nxdb')
  .description('Turns your Nx Project Graph into a database which you can query with a simplified query language')
  .version('1.0.0');

program
  .command('build')
  .action(async (options) => {
    await buildDatabaseAsync();
  });

program
  .command('reset')
  .description('Resets the NxDB database')
  .action(async() => {
    await resetDatabaseAsync();
  });

program
  .command('schema')
  .description('Prints the schema of the NxDB database')
  .action(() => {
    const schema = readSchema();
    printSchema(schema);
  });

program.parse(process.argv); 
