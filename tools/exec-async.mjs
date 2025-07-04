import { exec } from 'child_process';

export function execAsync(command) {
  return new Promise((resolve, reject) => {
    exec(command, (error, stdout) => {
      if (error) {
        reject(error);
      } else {
        resolve({ stdout });
      }
    });
  });
}
