import { expose as comlinkExpose } from "comlink";

const useNodeWorkarounds =
  typeof globalThis.Worker === "undefined" &&
  typeof (globalThis as any).WorkerNavigator === "undefined";

// Mangled so that bundlers don't try to inline the source.
const worker_threads_mangled = "w-orker-_threa-ds";
const worker_threads_unmangled = () => worker_threads_mangled.replace(/-/g, "");

export async function nodeEndpointPort(): Promise<MessagePort> {
  const { parentPort } = await import(worker_threads_unmangled()).catch();
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  const nodeEndpoint = (await import("comlink/dist/esm/node-adapter.mjs"))
    .default as (_: any) => MessagePort;
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
