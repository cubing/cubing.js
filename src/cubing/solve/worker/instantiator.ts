import { wrap } from "comlink";
import type { WorkerInsideAPI } from "./vendor/worker/strategy/types";

const useNodeWorkarounds = typeof globalThis.Worker === "undefined";

export async function instantiateWorker(): Promise<WorkerInsideAPI> {
  console.log("instantiateWorker");
  const { workerDataURL } = await import("./worker-inside-generated-string");

  // const blob = new Blob([workerContents], { type: "application/javascript" });
  // const workerURL = URL.createObjectURL(blob);
  // TODO: trampoline??
  let worker: Worker;
  if (useNodeWorkarounds) {
    const constructor = (await import("worker_threads")).Worker;
    const rawWorker = new constructor(workerDataURL);
    process.exit(1);
    // @ts-ignore
    const adapter = (await import("comlink/dist/esm/node-adapter.mjs")).default;
    worker = adapter(rawWorker);
  } else {
    worker = new Worker(workerDataURL, {
      type: "classic",
    });
  }
  return wrap(worker) as WorkerInsideAPI;
}
