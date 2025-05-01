import { PrintableShellCommand } from "printable-shell-command";

export async function rsync(
  localFolder: string,
  remoteFolder: string,
  options?: { delete?: boolean; exclude?: string[] },
) {
  const excludeArgs: [string, string][] = (
    options?.exclude ?? [".DS_Store", ".git"]
  ).map((s) => ["--exclude", s]);
  const deleteArgs = options?.delete ? ["--delete"] : [];
  await new PrintableShellCommand("rsync", [
    "-avz",
    ...excludeArgs,
    ...deleteArgs,
    localFolder,
    remoteFolder,
  ]).shellOutBun();
}
