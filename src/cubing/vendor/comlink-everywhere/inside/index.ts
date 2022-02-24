import { expose as comlinkExpose } from "comlink";
import nodeEndpoint from "../node-adapter";

const useNodeWorkarounds =
  typeof globalThis.Worker === "undefined" &&
  typeof (globalThis as any).WorkerNavigator === "undefined";

// Mangled so that bundlers don't try to inline the source.
const worker_threads_mangled = "w-orker-_threa-ds";
const worker_threads_unmangled = () => worker_threads_mangled.replace(/-/g, "");

export async function nodeEndpointPort(): Promise<
  Worker & {
    nodeWorker?: import("worker_threads").Worker;
  }
> {
  const { parentPort } = await import(
    /* @vite-ignore */ worker_threads_unmangled()
  ).catch();
  return nodeEndpoint(parentPort);
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
