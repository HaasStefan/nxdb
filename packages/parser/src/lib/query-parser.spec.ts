import { QueryParser } from './query-parser.js';
import { resolve } from 'node:path';

describe('QueryParser', () => {
  const queryParser: QueryParser = QueryParser.getInstance();

  it('should parse sample-01.nxql', () => {
    const filePath = resolve('../../queries/sample-01.nxql');
    const query = queryParser.parseQueryFromFile(filePath);
    expect(query).toEqual({
      type: 'Query',
      selection: {
        type: 'All',
      },
      source: 'projects',
      condition: {
        type: 'ComparisonExpression',
        left: 'name',
        operator: '=',
        right: '@nx-db/cli',
      },
    });
  });

  it('should parse sample-02.nxql', () => {
    const filePath = resolve('../../queries/sample-02.nxql');
    const query = queryParser.parseQueryFromFile(filePath);
    expect(query).toEqual({
      type: 'Query',
      selection: {
        type: 'All',
      },
      source: 'projects',
      condition: {
        type: 'InExpression',
        value: 'type:library',
        target: 'tags',
      },
    });
  });

  it('should parse sample-03.nxql', () => {
    const filePath = resolve('../../queries/sample-03.nxql');
    const query = queryParser.parseQueryFromFile(filePath);
    expect(query).toEqual({
      type: 'Query',
      selection: {
        type: 'All',
      },
      source: 'projects',
      condition: {
        type: 'ComparisonExpression',
        left: 'hello',
        operator: '=',
        right: 'world',
      },
    });
  });
});
