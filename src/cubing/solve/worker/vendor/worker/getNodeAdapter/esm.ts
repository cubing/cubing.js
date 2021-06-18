import type { NodeWorker } from "../strategy/types";

export async function getNodeAdapterESM(): Promise<
  (nodeWorker: NodeWorker) => Worker
> {
  // @ts-ignore
  return (await import("comlink/dist/esm/node-adapter.mjs")).default;
}
