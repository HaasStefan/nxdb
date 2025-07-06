export declare module './parser.js' {
  export function parse(input: string): Query;
}

export interface Query {
  type: 'Query';
  selection: {
    type: SelectionType;
  };
  source: SourceType;
  condition?: Expression;
}

export type SelectionType = 'All' | string;

export type SourceType = 'projects' | string;

export type ExpressionType =
  | 'ComparisonExpression'
  | 'InExpression'

export interface ComparisonExpression {
  type: 'ComparisonExpression';
  left: string;
  operator: '=' | '!=' | '<' | '>' | '<=' | '>=';
  right: string | number | boolean;
};

export interface InExpression {
  type: 'InExpression';
  value: string;
  target: string;
}

export type Expression = ComparisonExpression | InExpression;
