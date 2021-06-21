import { wrap } from "comlink";
import type { WorkerInsideAPI } from "./vendor/worker/strategy/types";

const useNodeWorkarounds = typeof globalThis.Worker === "undefined";

async function workerConstructor(): Promise<
  new (url: string, options: { type: "classic" | "module" }) => Worker
> {
  if (useNodeWorkarounds) {
    // @ts-ignore https://github.com/developit/web-worker/issues/13
    return (await import("web-worker")).default;
  } else {
    return globalThis.Worker;
  }
}

async function instantiateWorker(): Promise<Worker> {
  console.log("instantiateWorker");
  const { workerContents } = await import("./worker-inside-generated-string");

  const blob = new Blob([workerContents], { type: "application/javascript" });
  const workerURL = URL.createObjectURL(blob);
  // TODO: trampoline??
  const constructor = await workerConstructor();
  const worker = new constructor(workerURL, {
    type: "classic",
  });
  return worker;
}

export async function getWorker(): Promise<WorkerInsideAPI> {
  let instantiated = await instantiateWorker();
  if (useNodeWorkarounds) {
    // @ts-ignore
    const adapter = (await import("comlink/dist/esm/node-adapter.mjs")).default;
    instantiated = adapter(instantiated);
  }
  return wrap(instantiated) as WorkerInsideAPI;
}
