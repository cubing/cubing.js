import type { NodeWorker, URLReference } from "../strategy/types";

export function workerInstantiatorCJS(
  workerConstructor: typeof Worker | typeof NodeWorker,
  urlRef: URLReference
): Worker | NodeWorker {
  return new workerConstructor(urlRef as string);
}
