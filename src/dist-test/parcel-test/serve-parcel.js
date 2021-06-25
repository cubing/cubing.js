import { execPromise } from "../../../script/execPromise.js";

export const port = 1236;

const packagePath = new URL("./parcel-package", import.meta.url).pathname;

export function installServer() {
  execPromise("npm install", { cwd: packagePath });
}

export function startServer() {
  execPromise(`./node_modules/.bin/parcel serve --port ${port} index.html`, {
    cwd: packagePath,
  });
}
