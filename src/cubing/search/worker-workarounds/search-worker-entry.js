import { exposeAPI } from "./worker-guard";

if (exposeAPI.expose) {
  void import("../inside").then(() => {
    globalThis.postMessage("comlink-exposed"); // TODO: remove this
  });
}

// Workaround for `esbuild`: https://github.com/evanw/esbuild/issues/312#issuecomment-1092195778
export const WORKER_ENTRY_FILE_URL = import.meta.url;
