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
    process.on(eventName, (exitCode) => {
      if (existsSync(tempDir)) {
        console.log(
          `Build process is exiting (${eventName}). Removing: ${tempDir}`,
        );
        rmdirSync(tempDir);
      }
      process.exit(exitCode);
    });
  }
  return tempDir;
}

let cachedTempDir = null;
export function tempDir() {
  // TODO: When can we use `??=`?
  return (cachedTempDir = cachedTempDir ? cachedTempDir : tempDirUncached());
}
