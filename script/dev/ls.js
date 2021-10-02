import { stat, readdir } from "fs/promises";
import { join } from "path";

export async function listFilesWithSuffix(folderPath, suffix) {
  let childNames = await readdir(folderPath);

  let ownMatches = [];
  let recursiveMatches = [];

  for (const childName of childNames) {
    const childPath = join(folderPath, childName);
    if ((await stat(childPath)).isDirectory()) {
      recursiveMatches = recursiveMatches.concat(
        await listFilesWithSuffix(childPath, suffix),
      );
    } else if (childPath.endsWith(suffix)) {
      ownMatches.push(childPath);
    }
  }
  return ownMatches.concat(recursiveMatches);
}
