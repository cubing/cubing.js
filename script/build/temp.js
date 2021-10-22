// We use sync operations to reduce the risk of race conditions from
// interacting build systems.
import {
  mkdtempSync,
  rmdirSync,
  writeFileSync,
  renameSync,
  existsSync,
  mkdirSync,
} from "fs";
import { join } from "path";

const TEMP_ROOT = "./.temp/build/";

function tempDirUncached() {
  if (!existsSync(TEMP_ROOT)) {
    mkdirSync(TEMP_ROOT, { recursive: true });
  }
  const tempDir = mkdtempSync(TEMP_ROOT);

  // Try to clean up.
  // https://stackoverflow.com/a/49392671
  for (const eventName of ["exit", "SIGINT", "SIGTERM"]) {
    process.on(eventName, () => {
      if (existsSync(tempDir)) {
        console.log(
          `Build process is exiting (${eventName}). Removing: ${tempDir}`,
        );
        rmdirSync(tempDir);
      }
      process.exit(eventName === "exit" ? 0 : 1);
    });
  }
  return tempDir;
}

let cachedTempDir = null;
export function tempDir() {
  // TODO: When can we use `??=`?
  return (cachedTempDir = cachedTempDir ? cachedTempDir : tempDirUncached());
}

// We write using a temp file and move it, so that the target file only ever
// contains the full intended contents.
// This avoids issues like https://github.com/cubing/cubing.js/pull/138
export function writeSyncUsingTempFile(
  tempFilename,
  finalDestination,
  fileContents,
) {
  const tempFilePath = join(tempDir(), tempFilename);
  writeFileSync(tempFilePath, fileContents);
  renameSync(tempFilePath, finalDestination);
}
