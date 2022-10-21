import { execPromise } from "../lib/execPromise.js";

export async function execPromiseLogged(cmd) {
  console.log(cmd);
  return execPromise(cmd);
}

export async function rsync(localFolder, remoteFolder, options) {
  const excludeArgs = (options?.exclude ?? [".DS_Store", ".git"])
    .map((s) => `--exclude "${s}"`)
    .join(" ");
  await execPromiseLogged(
    `rsync -avz ${excludeArgs} ${
      options?.delete ? "--delete" : ""
    } "${localFolder}" "${remoteFolder}"`,
  );
}
