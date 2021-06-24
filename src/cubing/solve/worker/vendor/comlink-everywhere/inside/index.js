import { expose as comlinkExpose } from "comlink";

const useNodeWorkarounds = typeof globalThis.Worker === "undefined";

export function expose(api) {
  if (useNodeWorkarounds) {
    (async () => {
      const { port } = await import("./node.js");
      comlinkExpose(api, await port());
    })();
  } else {
    comlinkExpose(api);
  }
}
