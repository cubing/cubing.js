import nodeEndpoint from "../node-adapter";

export { wrap } from "comlink";
const useNodeWorkarounds =
  typeof globalThis.Worker === "undefined" &&
  typeof (globalThis as any).WorkerNavigator === "undefined";

async function nodeWorker(
  source: string | URL,
  options?: { eval?: boolean },
): Promise<Worker> {
  const { Worker: NodeWorker } = globalThis.process.getBuiltinModule(
    "node:worker_threads",
  );
  const worker = new NodeWorker(source, options);
  worker.unref();
  return nodeEndpoint(worker);
}

export async function constructWorker(
  source: string | URL,
  options?: { type?: WorkerType },
): Promise<Worker> {
  let worker: Worker;
  if (useNodeWorkarounds) {
    return nodeWorker(source);
  } else {
    worker = new globalThis.Worker(source, {
      type: options ? options.type : undefined, // TODO: Is it safe to use `options?.type`?
    });
  }
  return worker;
}
