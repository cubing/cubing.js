import nodeEndpoint from "../node-adapter";

export { wrap } from "comlink";
// Mangled so that bundlers don't try to inline the source.

const worker_threads_mangled = "node:w-orker-_threa-ds";
const worker_threads_unmangled = () => worker_threads_mangled.replace(/-/g, "");

const useNodeWorkarounds =
  typeof globalThis.Worker === "undefined" &&
  typeof (globalThis as any).WorkerNavigator === "undefined";

async function nodeWorker(
  source: string | URL,
  options?: { eval?: boolean },
): Promise<Worker> {
  const { Worker: NodeWorker } = await import(
    /* @vite-ignore */ worker_threads_unmangled()
  );
  const worker = new NodeWorker(source, options);
  worker.unref();
  return nodeEndpoint(worker);
}

export async function constructWorker(
  source: string | URL,
  options?: { eval?: boolean; type?: WorkerType },
): Promise<Worker> {
  let worker;
  if (useNodeWorkarounds) {
    return nodeWorker(source, { eval: options?.eval });
  } else {
    if (options?.eval) {
      const blob = new Blob([source as string], {
        type: "application/javascript",
      });
      source = URL.createObjectURL(blob);
    }
    worker = new globalThis.Worker(source, {
      type: options ? options.type : undefined, // TODO: Is it safe to use `options?.type`?
    });
  }
  return worker;
}
