import { exec } from "node:child_process";

/**
 * @param {string} cmd
 * @returns {Promise<string>}
 */
export function execPromise(cmd) {
  return new Promise((resolve, reject) => {
    const childProcess = exec(cmd, {}, (error, stdout, stderr) => {
      if (error) {
        reject(error);
      }
      // console.log(stdout);
      resolve(stdout ? stdout : stderr);
    });
  });
}
