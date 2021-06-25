import { execPromise } from "../../../script/execPromise.js";

export const port = 1236;

const packagePath = new URL("./parcel-package", import.meta.url).pathname;

export function installServer() {
  // TODO: safer cd?
  const command = `cd "${packagePath}"; npm install`;
  console.log("command:", command);
  execPromise(command);
}

export function startServer() {
  // TODO: safer cd?
  const command = `cd "${packagePath}"; npx parcel --port ${port} index.html`;
  console.log("command:", command);
  execPromise(command);
}
