import { nodeEndpointPort } from "../../vendor/comlink-everywhere/inside/index";
import { exposeAPI } from "./worker-guard";

if (exposeAPI.expose) {
  (async () => {
    await import("./entry.js");

    // // Workaround for `node`
    const messagePort = (globalThis as any).postMessage
      ? globalThis
      : await nodeEndpointPort();
    messagePort.postMessage("comlink-exposed");
  })();
}

export const WORKER_ENTRY_FILE_URL = import.meta.url;
