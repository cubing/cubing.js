import { execPromiseLogged } from "../lib/execPromise";

export async function rsync(
  localFolder: string,
  remoteFolder: string,
  options?: { delete?: boolean; exclude?: string[] },
) {
  const excludeArgs = (options?.exclude ?? [".DS_Store", ".git"])
    .map((s) => `--exclude "${s}"`)
    .join(" ");
  await execPromiseLogged(
    `rsync -avz ${excludeArgs} ${
      options?.delete ? "--delete" : ""
    } "${localFolder}" "${remoteFolder}"`,
  );
}
