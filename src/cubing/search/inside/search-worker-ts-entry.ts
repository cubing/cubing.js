import { nodeEndpointPort } from "../../vendor/apache/comlink-everywhere/inside/index";
import { exposeAPI } from "./worker-guard";

if (exposeAPI.expose) {
  (async () => {
    await import("./search-worker-js-entry.js");

    // // Workaround for `node`
    const messagePort = (globalThis as any).postMessage
      ? globalThis
      : await nodeEndpointPort();
    messagePort.postMessage("comlink-exposed");
  })();
}

export const WORKER_ENTRY_FILE_URL = import.meta.url;
