import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

export function getLinesOfCode(projectRoot, ignoreFolders = []) {
  let totalLines = 0;
  let htmlLines = 0;
  let jsLines = 0;
  let tsLines = 0;
  let tsxLines = 0;
  let jsxLines = 0;
  let cssLines = 0;
  let scssLines = 0;
  let lessLines = 0;
  let jsonLines = 0;
  let mdLines = 0;

  const allFiles = getAllFiles(projectRoot, ignoreFolders);
  for (const file of allFiles) {
    const ext = file.split('.').pop();
    if (ext === 'html') {
      htmlLines += countLines(file);
    } else if (ext === 'js') {
      jsLines += countLines(file);
    } else if (ext === 'ts') {
      tsLines += countLines(file);
    } else if (ext === 'css') {
      cssLines += countLines(file);
    } else if (ext === 'json') {
      jsonLines += countLines(file);
    } else if (ext === 'md') {
      mdLines += countLines(file);
    } else if (ext === 'tsx') {
      tsxLines += countLines(file);
    } else if (ext === 'jsx') {
      jsxLines += countLines(file);
    } else if (ext === 'scss') {
      scssLines += countLines(file);
    } else if (ext === 'less') {
      lessLines += countLines(file);
    }
  }

  totalLines = htmlLines + jsLines + tsLines + cssLines + jsonLines + mdLines;

  return {
    totalLines,
    htmlLines,
    jsLines,
    tsLines,
    cssLines,
    jsonLines,
    mdLines,
    tsxLines,
    jsxLines,
    scssLines,
    lessLines,
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
