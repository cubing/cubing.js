import type { NodeWorker } from "../strategy/types";

export async function getNodeAdapterCJS(): Promise<
  (nodeWorker: NodeWorker) => Worker
> {
  // @ts-ignore
  return (await import("comlink/dist/umd/node-adapter.js")).default;
}
