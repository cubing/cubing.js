import { wrap } from "comlink";
import type {
  ModuleSystem,
  NodeWorker,
  RuntimeEnvironment,
  URLReference,
  WorkerInsideAPI,
} from "./types";

export const outsideStrategy = {
  url: {
    esm: null,
    cjs: null,
  } as Record<ModuleSystem, null | URLReference>,
  getNodeAdapter: {
    esm: null,
    cjs: null,
  } as Record<
    ModuleSystem,
    null | (() => Promise<(worker: NodeWorker) => Worker>)
  >,
  getWorkerConstructor: {
    node: null as null | (() => Promise<typeof NodeWorker>),
    browser: null as null | (() => Promise<typeof Worker>),
  },
  workerInstantiator: {
    esm: null,
    cjs: null,
  } as Record<
    ModuleSystem,
    | null
    | ((
        workerConstructor: typeof Worker | typeof NodeWorker,
        urlRef: URLReference
      ) => Worker | NodeWorker)
  >,
  trampoline: {
    // node: null,
    browser: null,
  } as Record<RuntimeEnvironment, null | ((url: URLReference) => string)>,
};

export async function getWorker(): Promise<WorkerInsideAPI> {
  const url: URLReference = outsideStrategy.url.esm ?? outsideStrategy.url.cjs!;
  const workerInstantiator =
    outsideStrategy.workerInstantiator.esm ??
    outsideStrategy.workerInstantiator.cjs!;
  let worker: Worker;
  if (typeof Worker !== "undefined") {
    // browser
    const constructor: typeof Worker = await outsideStrategy
      .getWorkerConstructor.browser!();
    try {
      worker = workerInstantiator(constructor, url) as Worker;
    } catch (e) {
      const trampoline = outsideStrategy.trampoline.browser!;
      worker = workerInstantiator(constructor, trampoline(url)) as Worker;
    }
  } else {
    // node
    const constructor: typeof NodeWorker = await outsideStrategy
      .getWorkerConstructor.node!();
    const nodeWorker: NodeWorker = workerInstantiator(
      constructor,
      url
    ) as NodeWorker;
    const getNodeAdapter =
      outsideStrategy.getNodeAdapter.esm ?? outsideStrategy.getNodeAdapter.cjs!;
    const nodeAdapter = await getNodeAdapter();
    worker = nodeAdapter(nodeWorker);
  }
  return wrap(worker as any) as WorkerInsideAPI;
}
