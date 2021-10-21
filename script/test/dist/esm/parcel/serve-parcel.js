import { mkdirSync } from "fs";
import { join } from "path";
import { execPromise } from "../../../../lib/execPromise.js";

export const port = 1236;

const packageSrcPath = new URL("./parcel-package", import.meta.url).pathname; // relative to this file
const packageTempRoot = new URL("../../../../../.temp", import.meta.url)
  .pathname;
const packageTempPath = join(packageTempRoot, "parcel-package");

export async function installServer() {
  mkdirSync(packageTempRoot, { recursive: true });
  await execPromise(`cp -R ${packageSrcPath} ${packageTempRoot}`); // TODO: cpSync?
  await execPromise("npm install", { cwd: packageTempPath });
}

export function startServer() {
  execPromise(`npx parcel serve --port ${port} index.html`, {
    cwd: packageTempPath,
  }).then(console.error);
}
