import { wrap } from "comlink";
import type { WorkerInsideAPI } from "./vendor/api/inside";
import type { URL as NodeURL } from "url";

const useNodeWorkarounds = typeof globalThis.Worker === "undefined";

export async function instantiateWorker(): Promise<{
  wrappedWorker: WorkerInsideAPI;
  terminate: () => void;
}> {
  console.log("instantiateWorker");
  // const { workerSource } = await import("./worker-inside-generated-string");

  // if (!import.meta.url) {
  //   // We will need to rely on `new Worker(new URL(workerEntryPath, import.meta.url))` in the future.
  //   console.warn(
  //     "WARNING: `cubing/solve` is not being used in a module environment. Future versions of `cubing.js` might require a module environment for `cubing/solve`.",
  //   );
  // }

  // TODO: trampoline??
  let terminate: () => void;
  let worker: Worker;
  if (useNodeWorkarounds) {
    const constructor = (await import("worker_threads")).Worker;
    const rawWorker = new constructor(
      new URL(
        "./worker-inside-generated-string.cjs",
        import.meta.url,
      ) as NodeURL,
    );
    terminate = rawWorker.terminate.bind(rawWorker);
    // @ts-ignore
    const adapter = (await import("comlink/dist/esm/node-adapter.mjs")).default;
    worker = adapter(rawWorker);
  } else {
    worker = new Worker(
      new URL("./worker-inside-generated-string.cjs", import.meta.url),
      {
        type: "classic",
      },
    );
    terminate = worker.terminate.bind(worker);
  }
  const returno = { wrappedWorker: wrap(worker) as WorkerInsideAPI, terminate };
  console.log("returno", returno);
  return returno;
}
