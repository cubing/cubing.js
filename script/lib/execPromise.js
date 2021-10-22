import { exec } from "child_process";

const childProcesses = [];
export function killAllChildProcesses() {
  for (const childProcess of childProcesses) {
    try {
      if (childProcess.exitCode !== null) {
        console.log("Child process has already finished:", childProcess.pid);
      } else {
        console.log("Killing child process with pid:", childProcess.pid);
        console.log("Killed successfully:", childProcess.kill("SIGKILL"));
      }
    } catch (e) {
      /* */
    }
  }
}

export function execPromise(cmd, options) {
  return new Promise((resolve, reject) => {
    const childProcess = exec(cmd, options, (error, stdout, stderr) => {
      if (error) {
        reject(error);
      }
      // console.log(stdout);
      resolve(stdout ? stdout : stderr);
    });
    childProcesses.push(childProcess);
  });
}
