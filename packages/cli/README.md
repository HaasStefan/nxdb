
# NxDB CLI

This is the CLI for NxDB, which is a local analytics database that integrates into Nx, to make the project graph queryable like SQL with extensions and utilities for graphs.

## Getting Started

First, you need to setup NxDB configurations for your monorepo. Run the following command to generate config files:

```plaintext
npx nxdb init
```

This will also automatically build the database.

## Commands

### Build

The database will not auto-update data and becomes stale. Therefore, whenever you want to make queries and have made changes, you should first run a build, which will replace the stale database with the current representation.

```plaintext
npx nxdb build
```

### Interactive

If you want to quickly run some queries, you can use the interactive mode, which lets you write queries right in the terminal.

Run the following command:
```plaintext
npx nxdb
```

### Query

You can also save your queries to `.nxql` files and execute queries from files. In order to do this, run the following:

```plaintext
npx nxdb query <filePath>
```

## Adding Custom Fields to Projects 

You can add custom fields to each project, like `numberOfCommitsInLastMonth`, or `linesOfCode`, by modifying the NxDB Schema in `.nxdb.schema.json` to include the custom fields where each has a type, description and default.
> Note, that the only prohibited values are primitives including string, number, boolean, string[], number[], boolean[]

Then, you can modify either the root `.nxdb.config.base.mjs` file or the project level `.nxdb.config.mjs` file to return the new custom field in the default exported function, which is invoked by the DB build `npx nxdb build` for each project to dynamically add these custom fields. You can later query against those fields as they become part of the `projects` table.

You can take a look at the [NxDB GitHub Repo](https://github.com/HaasStefan/nxdb) to see this in action.