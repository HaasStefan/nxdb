import { exec } from 'child_process';
import { promisify } from 'util';

export interface ExecResult {
  stdout: string;
  stderr: string;
}

export interface ExecOptions {
  cwd?: string;
  env?: NodeJS.ProcessEnv;
  encoding?: BufferEncoding;
  timeout?: number;
  maxBuffer?: number;
  killSignal?: NodeJS.Signals | number;
  uid?: number;
  gid?: number;
  windowsHide?: boolean;
}

/**
 * Executes a shell command asynchronously using async/await
 * @param command - The command to execute
 * @param options - Optional execution options
 * @returns Promise that resolves with stdout and stderr
 */
export async function execAsync(
  command: string, 
  options?: ExecOptions
): Promise<ExecResult> {
  return new Promise((resolve, reject) => {
    exec(command, options, (error, stdout, stderr) => {
      if (error) {
        // Attach stdout and stderr to the error for better debugging
        const enrichedError = error as Error & { stdout?: string; stderr?: string };
        enrichedError.stdout = stdout.toString();
        enrichedError.stderr = stderr.toString();
        reject(enrichedError);
      } else {
        resolve({
          stdout: stdout.toString(),
          stderr: stderr.toString()
        });
      }
    });
  });
}

/**
 * Alternative implementation using Node.js built-in promisify utility
 * This is a simpler approach but provides less control over error handling
 */
export const execAsyncBuiltin = promisify(exec);

