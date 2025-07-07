import type { Primitive } from '@nx-db/db';

export type Result = Record<string, Primitive>;

export interface QueryResult {
  results: Partial<Result>[];
  total: number;
  selection: string[]; 
}
