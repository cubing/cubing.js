import { exposeAPI } from "./worker-guard";

if (exposeAPI.expose) {
  await import("../inside");

  // Workaround for `node`'
  if (globalThis.postMessage) {
    globalThis.postMessage("comlink-exposed"); // TODO: remove this
  } else {
    globalThis.process
      .getBuiltinModule("node:worker_threads")
      .parentPort?.postMessage("comlink-exposed");
  }
}

// Workaround for `esbuild`: https://github.com/evanw/esbuild/issues/312#issuecomment-1092195778
export const WORKER_ENTRY_FILE_URL = import.meta.url;
