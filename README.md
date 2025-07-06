<p align="center">
  <img src="https://github.com/user-attachments/assets/07b4317c-2c27-4b1e-888a-44b416bb1293" alt="ng-di-analyzer logo" width="250" height="250" />
</p>

<h1 align="center">Nx DB</h1>

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

# Queries

Currently, in the MVP, only some very simple queries are supported. 

## Samples

### Sample 1

```sql
SELECT * FROM projects WHERE name = '@nxdb/cli'
```

### Sample 2

```sql
SELECT name, root, tags FROM projects
```

### Sample 3

```sql
SELECT * FROM projects WHERE 'type:library' IN tags
```

### Sample 4

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
