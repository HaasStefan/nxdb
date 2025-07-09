import { createWriteStream, existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const historyFilePath = resolve('.nxdb', 'history.txt');
export function restoreHistory(): string[] {
  if (existsSync(historyFilePath)) {
    const historyFile = readFileSync(historyFilePath, 'utf-8');
    return historyFile.split('\n').filter((line) => line.trim() !== '');
  }
  return [];
}

export function saveCommandToHistory(command: string): void {
  const stream = createWriteStream(historyFilePath, { flags: 'a' });
  stream.write(`${command}\n`);
  stream.end(() => {
    // Ensure the file is closed after writing
  });
}
