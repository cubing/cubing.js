import { expose as comlinkExpose } from "comlink";

const useNodeWorkarounds =
  typeof globalThis.Worker === "undefined" &&
  typeof globalThis.WorkerNavigator === "undefined";

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
