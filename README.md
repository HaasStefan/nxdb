<p align="center">
  <img src="https://github.com/user-attachments/assets/8decd2f8-4eba-4308-a47f-6cdf91438879" alt="ng-di-analyzer logo" width="250" height="250" />
</p>

<h1 align="center">NxDB</h1>

<p align="center">
  🌊 Query your Nx Project Graph with SQL
</p>

<p align="center">
<img src="https://img.shields.io/badge/status-work%20in%20progress-orange?style=for-the-badge" alt="Work in Progress Badge" />
</p>

# Introduction

NxDB is a tool that sits on top of your Nx monorepo, that builds a representation of your project graph and allows you to dynamically extend each project with additional custom fields. This database can be queried using a custom SQL-like query language called NxQL, which is optimized for project graph queries.

You will be happy to use this tool, if you want to analyse large and complex project graphs. If you want to figure out, which projects in your project graph make good candidates for buildable libs in an incremental build setup, you can extend the projects metrics with custom fields, such as `linesOfCode`, `projectHealth`, `numberOfCommitsInLastMonth`, `participatesInCycles`, which you can then query against to analyse your graph in a smart and generic way.

You can save your queries and load queries from files. You could have:

```plaintext
nx-workspace/
├── packages/
├── queries/
│   ├── buildable-lib-candidates.nxql
│   ├── leaf-projects.nxql
│   ├── hotspot-projects.nxql
│   └── unhealthy-projects.nxql
├── .nxdb.config.base.mjs
├── .nxdb.schema.json
├── nx.json
└── package.json
```

# Installation

```
npm install -D nxdb
```

# Getting Started

First, you need to initialize NxDB once with the following command:

```plaintext
nxdb init
```

This will add the `.nxdb` directory to your `.gitignore` file and generate all the required nxdb config files and schema file. It will also trigger a nxdb build, such that the database is constructed locally.

Then, you can already run your first query, by running the following command:

```plaintext
nxdb query <queryFile>
```

queryFile... This is the path to an NxQL file which should have the file extension `.nxql`.

If you want to run queries interactively, just run:

```plaintext
nxdb
```

This will enter interactive mode, where you can write queries in the terminal and get the results there, until you end the session.

> Note, there are no automatic DB updates when the project graph changes, as building the DB with custom fields could be quite expensive depending on the size of the repo. Therefore, you have to manually update the database, whenever you want to query the database. For this, run `nxdb build`. This might seem weird, coming from a traditional database, but NxDB is thrown away completely and replaced with new data.

# Queries

Currently, in the MVP, only some very simple queries are supported. 

## Examples

### Example 1

```sql
SELECT * FROM projects WHERE name = '@nxdb/cli'
```

### Example 2

```sql
SELECT name, root, tags FROM projects
```

### Example 3

```sql
SELECT * FROM projects WHERE 'type:library' IN tags
```

### Example 4

```sql
SELECT * FROM projects WHERE 'build' IN targets
```

# Roadmap

The query language is the top focus at the moment and will continuously be expanded. In the end it should support complex queries like these:

```sql
-- Find good buildable library candidates
SELECT p.name
FROM projects AS p
WHERE p.numberOfCommits < 5
  AND len(p.dependencies) < 5
  AND NOT EXISTS (
    -- Find any dependency path from p to a leaf violating the conditions
    SELECT 1
    FROM UNNEST(p.dependencies) AS dep
    LET paths = allPaths(p.name, dep)
    WHERE EXISTS (
      SELECT 1 FROM UNNEST(paths) AS path
      WHERE len(path) > 5                         -- path too long
         OR EXISTS (
           SELECT 1 FROM UNNEST(path) AS projOnPath
           WHERE (SELECT TOP 1 numberOfCommits FROM projects WHERE name = projOnPath) > p.numberOfCommits
         )
    )
  )
LIMIT 20;
```

Other feature items:
- [ ] Extensive docs page
- [ ] Querying Task Graph
- [ ] UI with tables and query editor