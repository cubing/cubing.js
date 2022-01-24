// Mangled so that bundlers don't try to inline the source.
const worker_threads_mangled = "w-orker-_threa-ds";
const worker_threads_unmangled = () => worker_threads_mangled.replace(/-/g, "");

export async function port() {
  const { parentPort } = await import(worker_threads_unmangled()).catch();
  const nodeEndpoint = (await import("comlink/dist/esm/node-adapter.mjs"))
    .default;
  return nodeEndpoint(parentPort);
}
