import { program } from 'commander';
import { buildDatabaseAsync } from '@nxdb/db';

program
  .name('nxdb')
  .description('Turns your Nx Project Graph into a database which you can query with a simplified query language')
  .version('1.0.0');

program
  .command('build')
  .action(async (options) => {
    await buildDatabaseAsync();
  });

program.parse(process.argv); 