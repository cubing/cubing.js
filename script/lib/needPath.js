import { Path } from "path-class";

/**
 *
 * @param {Path} folderPath
 * @param {string} cmd
 * @returns {Promise<void>}
 */
export async function needPath(folderPath, cmd) {
  if (!(folderPath instanceof Path)) {
    throw new Error("Specified `folderPath` needs to be a `Path`.");
  }
  if (!(await folderPath.exists())) {
    console.error(
      `\nPath does not exist:\n${folderPath}\n\nRun \`${cmd}\` first!\n\b`,
    );
    process.exit(1);
  }
}
