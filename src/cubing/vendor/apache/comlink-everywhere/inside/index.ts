import { expose as comlinkExpose } from "comlink";
import nodeEndpoint from "../node-adapter";

const useNodeWorkarounds =
  typeof globalThis.Worker === "undefined" &&
  typeof (globalThis as any).WorkerNavigator === "undefined";

export async function nodeEndpointPort(): Promise<
  Worker & {
    nodeWorker?: import("node:worker_threads").Worker;
  }
> {
  const { parentPort } = globalThis.process.getBuiltinModule(
    "node:worker_threads",
  );
  return nodeEndpoint(
    parentPort as unknown as import("node:worker_threads").Worker,
  );
}

export function expose(api: any) {
  if (useNodeWorkarounds) {
    (async () => {
      comlinkExpose(api, await nodeEndpointPort());
    })();
  } else {
    comlinkExpose(api);
  }
}
