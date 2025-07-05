export class TemplateEngine {
  private static instance: TemplateEngine | null = null;

  private readonly templateFiles: Record<string, string> = {
    ['.nxdb.config.base.mjs']: baseConfig,
    ['.nxdb.config.mjs']: projectConfig,
  };

  private constructor() {
    // Private constructor to prevent direct instantiation
  }

  static getInstance(): TemplateEngine {
    if (!TemplateEngine.instance) {
      TemplateEngine.instance = new TemplateEngine();
    }
    return TemplateEngine.instance;
  }

  getFile(fileName: string, fileReplacements: Record<string, string>): string {
    const escpaedReplacements: Record<string, string> = Object.entries(
      fileReplacements
    ).reduce((acc, [key, value]) => {
      acc[`<%=${key}%>`] = value;
      return acc;
    }, {} as Record<string, string>);

    if (!this.templateFiles[fileName]) {
      throw new Error(`Template file ${fileName} does not exist.`);
    }

    const fileContent = this.templateFiles[fileName];
    return Object.entries(escpaedReplacements).reduce(
      (content, [key, value]) => {
        return content.replace(new RegExp(key, 'g'), value);
      },
      fileContent
    );
  }
}

const baseConfig = `
export default async function (projectRoot) {
  return {
    // numberOfCommits: await computeNumberOfCommits(projectRoot),
    // linesOfCode: await computeLinesOfCode(projectRoot)
  };
}
`;

const projectConfig = `
import baseFnAsync from '<%=relativeBaseConfigPath%>';
import { resolve } from 'node:path';

export default async function () {
  const projectRoot = resolve(import.meta.dirname);
  const baseCustomFields = await baseFnAsync(projectRoot);

  return {
    ...baseCustomFields
  };
}
`;
