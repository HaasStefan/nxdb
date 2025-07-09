import { program } from 'commander';
import {
  buildDatabaseAsync,
  initializeDatabaseAsync,
  printSchema,
  readSchema,
  resetDatabaseAsync,
} from '@nx-db/db';
import {
  printQueryResultAsTable,
  QueryParser,
  runQueryAsync,
} from '@nx-db/parser';
import { writeFileSync } from 'node:fs';
import chalk from 'chalk';
import readline from 'node:readline';
import { restoreHistory, saveCommandToHistory } from './history.js';

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
      const results = await runQueryAsync(query);

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
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: chalk.magenta('>> '),
    history: restoreHistory().reverse(), // Load history in reverse order
  });


  const run = async () => {
    console.clear();
    rl.prompt();

    rl.on('line', async (input: any) => {
      const queryFromPrompt = input.trim();
      
      // Add to history unless empty
      if (queryFromPrompt !== '') {
        saveCommandToHistory(queryFromPrompt);
      }

      // Exit logic
      if (['exit', 'stop', 'quit'].includes(queryFromPrompt.toLowerCase())) {
        console.log(chalk.green('Exiting interactive mode.'));
        rl.close();
        process.exit(0);
      }

      // Clear screen
      if (['clear', 'cls'].includes(queryFromPrompt.toLowerCase())) {
        console.clear();
        rl.prompt();
        return;
      }

      // Validation
      if (queryFromPrompt === '') {
        console.log(chalk.red('Query cannot be empty.'));
        rl.prompt();
        return;
      }

      // Run query
      try {
        rl.pause(); // suspend input so output doesn't clash
        const queryParser = QueryParser.getInstance();
        const query = queryParser.parseFromQuery(queryFromPrompt);
        const results = await runQueryAsync(query);

        if (results.total === 0) {
          console.log(chalk.yellow('No results found.'));
        } else {
          printQueryResultAsTable(
            results,
            parseInt(process.env.MAX_COLUMNS || '6', 10),
            parseInt(process.env.MAX_ROWS || '20', 10)
          );
        }
      } catch (error) {
        console.error(chalk.red('Error running query!'));
        console.error(
          chalk.red(
            error instanceof Error ? error.message : 'An unknown error occurred'
          )
        );
      }

      rl.resume(); // resume input
      readline.emitKeypressEvents(process.stdin);
      if (process.stdin.isTTY) process.stdin.setRawMode(true);
      rl.prompt();
    });

    rl.on('SIGINT', () => {
      console.log(chalk.green('\nExiting interactive mode.'));
      rl.close();
      process.exit(0);
    });
  };

  run();
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
