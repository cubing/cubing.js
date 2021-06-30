export async function port() {
  const { parentPort } = await import("worker_threads").catch();
  const nodeEndpoint = (await import("comlink/dist/esm/node-adapter.mjs"))
    .default;
  return nodeEndpoint(parentPort);
}
