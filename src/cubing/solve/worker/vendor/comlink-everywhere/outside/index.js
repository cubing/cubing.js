export { wrap } from "comlink";

const useNodeWorkarounds = typeof globalThis.Worker === "undefined";

export async function workerFileConstructor() {
  if (useNodeWorkarounds) {
    return await (await import("./node.js")).NodeWorkerWrapper();
  } else {
    return globalThis.Worker;
  }
}

export async function constructWorkerFromString(stringSource, options) {
  let worker;
  if (useNodeWorkarounds) {
    const constructor = await (
      await import("./node.js")
    ).NodeWorkerStringWrapper();
    const worker = new constructor(stringSource);
    return worker;
  } else {
    const blob = new Blob([stringSource], { type: "application/javascript" });
    const workerURL = URL.createObjectURL(blob);
    worker = new globalThis.Worker(workerURL, {
      type: options ? options.type : undefined, // TODO: Is it safe to use `options?.type`?
    });
  }
  return worker;
}
