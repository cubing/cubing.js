import { exec, spawn } from "child_process";

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

export function spawnPromise(cmd, args) {
  return new Promise((resolve, reject) => {
    const childProcess = spawn(cmd, args, {stdio: "inherit", stderr: "inherit"}); // Output to shell.
    childProcess.on("error", (error) => {
      console.error(error);
      reject();
    });
    childProcess.on("close", (exitCode) => {
      exitCode === 0 ? resolve() : reject();
    });
    childProcess.on("exit", (exitCode) => {
      exitCode === 0 ? resolve() : reject();
    });
    childProcesses.push(childProcess);
  });
}
