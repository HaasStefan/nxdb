import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

export function getLinesOfCode(projectRoot, ignoreFolders = []) {
  let totalLinesOfCode = 0;
  let htmlLinesOfCode = 0;
  let jsLinesOfCode = 0;
  let tsLinesOfCode = 0;
  let tsxLinesOfCode = 0;
  let jsxLinesOfCode = 0;
  let cssLinesOfCode = 0;
  let scssLinesOfCode = 0;
  let lessLinesOfCode = 0;
  let jsonLinesOfCode = 0;
  let mdLinesOfCode = 0;

  const allFiles = getAllFiles(projectRoot, ignoreFolders);
  for (const file of allFiles) {
    const ext = file.split('.').pop();
    if (ext === 'html') {
      htmlLinesOfCode += countLines(file);
    } else if (ext === 'js') {
      jsLinesOfCode += countLines(file);
    } else if (ext === 'ts') {
      tsLinesOfCode += countLines(file);
    } else if (ext === 'css') {
      cssLinesOfCode += countLines(file);
    } else if (ext === 'json') {
      jsonLinesOfCode += countLines(file);
    } else if (ext === 'md') {
      mdLinesOfCode += countLines(file);
    } else if (ext === 'tsx') {
      tsxLinesOfCode += countLines(file);
    } else if (ext === 'jsx') {
      jsxLinesOfCode += countLines(file);
    } else if (ext === 'scss') {
      scssLinesOfCode += countLines(file);
    } else if (ext === 'less') {
      lessLinesOfCode += countLines(file);
    }
  }

  totalLinesOfCode = htmlLinesOfCode + jsLinesOfCode + tsLinesOfCode + cssLinesOfCode + jsonLinesOfCode + mdLinesOfCode;

  return {
    totalLinesOfCode,
    htmlLinesOfCode,
    jsLinesOfCode,
    tsLinesOfCode,
    cssLinesOfCode,
    jsonLinesOfCode,
    mdLinesOfCode,
    tsxLinesOfCode,
    jsxLinesOfCode,
    scssLinesOfCode,
    lessLinesOfCode,
    numberOfFiles: allFiles.length
  };
}

export function getAllFiles(projectRoot, ignoreFolders = []) {
  let files = [];
  const items = readdirSync(projectRoot, { withFileTypes: true });

  for (const item of items) {
    const itemPath = join(projectRoot, item.name);
    if (item.isDirectory()) {
      if (!ignoreFolders.includes(item.name)) {
        files = files.concat(getAllFiles(itemPath, ignoreFolders));
      }
    } else {
      files.push(itemPath);
    }
  }

  return files;
}

function countLines(filePath) {
  const content = readFileSync(filePath, 'utf-8');
  const lines = content.split('\n').filter(line => line.trim() !== '');
  return lines.length;
}
