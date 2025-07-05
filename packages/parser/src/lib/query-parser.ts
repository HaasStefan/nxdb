import { existsSync, readFileSync } from 'node:fs';
import { parse } from './parser/parser.js';

export class QueryParser {
  private static instance: QueryParser | null = null;

  private constructor() {
    // Private constructor to prevent instantiation
  }

  static getInstance(): QueryParser {
    if (this.instance === null) {
      this.instance = new QueryParser();
    }
    return this.instance;
  }

  parseQueryFromFile(filePath: string) {

    if (!existsSync(filePath)) {
      throw new Error(`File not found: ${filePath}`);
    }

    if (!filePath.endsWith('.nxql')) {
      throw new Error(`Invalid file type: ${filePath}. Expected a .nxql file.`);
    }

    const fileContent = readFileSync(filePath, 'utf-8');

    return this.parseFromQuery(fileContent);
  }

  parseFromQuery(query: string) {
    try {
      return parse(query);
    } catch (error: unknown) {
      throw new Error(`Failed to parse query: ${JSON.stringify(error)}`);
    }
  }
}