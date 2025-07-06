# NxQL

## Peggy

For creating the parser, I am using peggy, which is a grammar for parser, which is parsed and peggy created an imperative parser in JS. 

Here is an online playground to play with the grammar: https://peggyjs.org/online.html

## Todo

MVP Support:
1. Multi Field Selection (`SELECT name, root, type FROM projects`)
2. Comments (`-- this is a comment`)
3. No Condition (`SELECT * FROM projects`)
4. InExpression (`SELECT * FROM projects WHERE 'type:library' IN tags`)
5. AND
6. OR

V1:
1. LET statements
2. graph utility functions (`shortestPath(from, to), len(), ...`)
3. AND (NOT) EXISTS
4. OR (NOT) EXISTS
5. SELECT 1 FROM unnest(paths) AS path