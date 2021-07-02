import { execPromise } from "../../../../lib/execPromise.js";

export const port = 1236;

const packagePath = new URL("./parcel-package", import.meta.url).pathname;

export async function installServer() {
  await execPromise("npm install", { cwd: packagePath });
}

export function startServer() {
  execPromise(`npx parcel serve --port ${port} index.html`, {
    cwd: packagePath,
  });
}
