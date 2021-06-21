import { wrap } from "comlink";
import type { WorkerInsideAPI } from "./vendor/worker/strategy/types";

const useNodeWorkarounds = typeof globalThis.Worker === "undefined";

export async function instantiateWorker(): Promise<{
  wrappedWorker: WorkerInsideAPI;
  terminate: () => void;
}> {
  console.log("instantiateWorker");
  const { workerSource } = await import("./worker-inside-generated-string");

  // TODO: trampoline??
  let terminate: () => void;
  let worker: Worker;
  if (useNodeWorkarounds) {
    const constructor = (await import("worker_threads")).Worker;
    const rawWorker = new constructor(workerSource, { eval: true });
    terminate = rawWorker.terminate.bind(rawWorker);
    // @ts-ignore
    const adapter = (await import("comlink/dist/esm/node-adapter.mjs")).default;
    worker = adapter(rawWorker);
  } else {
    const blob = new Blob([workerSource], { type: "application/javascript" });
    const workerURL = URL.createObjectURL(blob);
    worker = new Worker(workerURL, {
      type: "classic",
    });
    terminate = worker.terminate.bind(worker);
  }
  return { wrappedWorker: wrap(worker) as WorkerInsideAPI, terminate };
}
