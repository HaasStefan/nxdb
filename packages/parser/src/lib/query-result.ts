import type { Primitive } from '@nxdb/db';

export type Result = Record<string, Primitive>;

export interface QueryResult {
  results: Partial<Result>[];
  total: number;
  selection: string[]; 
}
