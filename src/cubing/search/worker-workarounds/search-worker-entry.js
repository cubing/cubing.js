import { nodeEndpointPort } from "../../vendor/apache/comlink-everywhere/inside/index";
import { exposeAPI } from "./worker-guard";

if (exposeAPI.expose) {
  (async () => {
    await import("../inside");

    // Workaround for `node`'
    // @ts-expect-error(TS2774): `globalThis.postMessage` does not exist in `node`, but the types do not reflect that.
    const messagePort = globalThis.postMessage
      ? globalThis
      : await nodeEndpointPort();
    messagePort.postMessage("comlink-exposed"); // TODO: remove this
  })();
}

// Workaround for `esbuild`: https://github.com/evanw/esbuild/issues/312#issuecomment-1092195778
export const WORKER_ENTRY_FILE_URL = import.meta.url;
