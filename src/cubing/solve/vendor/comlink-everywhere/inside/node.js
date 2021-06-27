// TODO: Inline this again once https://github.com/snowpackjs/snowpack/pull/3499 is resolved.
const WORKER_THREADS = "worker_threads";

export async function port() {
  const { parentPort } = await import(WORKER_THREADS);
  const nodeEndpoint = (await import("comlink/dist/esm/node-adapter.mjs"))
    .default;
  return nodeEndpoint(parentPort);
}
