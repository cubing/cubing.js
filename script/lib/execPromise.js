import { ChildProcess, exec, spawn } from "node:child_process";

/** @type ChildProcess[] */
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
    childProcesses.push(childProcess);
  });
}

/**
 * @param {string} cmd
 * @returns {Promise<string>}
 */
export async function execPromiseLogged(cmd) {
  console.log(cmd);
  return execPromise(cmd);
}

/**
 * @type {string} cmd
 * @type {string[]} args
 * @returns {Promise<void>}
 */
export function spawnPromise(cmd, args) {
  return new Promise((resolve, reject) => {
    const childProcess = spawn(cmd, args, {
      stdio: "inherit",
      // stderr: "inherit", // TODO
    }); // Output to shell.
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

/**
 * @type {string} cmd
 * @type {string[]} args
 * @returns {Promise<void>}
 */
export function spawnPromiseForPrintableShellCommand(printableShellCommand) {
  const [commandName, args] = printableShellCommand.forNode();
  return spawnPromise(commandName, args);
}
