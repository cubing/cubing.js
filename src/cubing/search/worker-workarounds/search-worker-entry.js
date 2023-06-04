import { nodeEndpointPort } from "../../vendor/apache/comlink-everywhere/inside/index";
import { exposeAPI } from "./worker-guard";

if (exposeAPI.expose) {
  (async () => {
    await import("../inside");

    // Workaround for `node`
    const messagePort = globalThis.postMessage
      ? globalThis
      : await nodeEndpointPort();
    messagePort.postMessage("comlink-exposed"); // TODO: remove this
  })();
}

// Workaround for `esbuild`: https://github.com/evanw/esbuild/issues/312#issuecomment-1092195778
export const WORKER_ENTRY_FILE_URL = import.meta.url;
