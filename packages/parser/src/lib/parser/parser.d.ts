export declare module './parser.js' {
  export function parse(input: string): Query;
}

export interface Query {
  type: 'Query';
  selection: Selection;
  source: SourceType;
  condition?: Expression;
}

export interface Selection {
  type: SelectionType;
  values?: string[];
}

export type SelectionType = 'All' | 'List';

export type SourceType = 'projects' | string;

export type ExpressionType = 'ComparisonExpression' | 'InExpression';

export interface ComparisonExpression {
  type: 'ComparisonExpression';
  left: string;
  operator: '=' | '!=' | '<' | '>' | '<=' | '>=';
  right: string | number | boolean;
}

export interface InExpression {
  type: 'InExpression';
  value: string;
  target: string;
}

export type Expression = ComparisonExpression | InExpression;
