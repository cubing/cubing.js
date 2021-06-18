import { expose } from "comlink";
import { insideAPI } from "../../api/inside";
import type { ModuleSystem, NodeWorker, RuntimeEnvironment } from "./types";

export const insideStrategy = {
  getParentPort: {
    browser: null,
    node: null,
  } as Record<RuntimeEnvironment, null | (() => Promise<MessagePort>)>,
  getNodeAdapter: {
    esm: null,
    cjs: null,
  } as Record<
    ModuleSystem,
    null | (() => Promise<(worker: NodeWorker | MessagePort) => Worker>)
  >,
};

export async function exposeAPI(): Promise<void> {
  // `typeof Worker` is "undefined" in Safari, so we use `typeof
  // WorkerNavigator`.
  // @ts-ignore
  if (typeof WorkerNavigator === "undefined") {
    const parentPort: MessagePort = await insideStrategy.getParentPort.node!();
    const getNodeAdapter = await (
      insideStrategy.getNodeAdapter.esm ?? insideStrategy.getNodeAdapter.cjs!
    )();
    expose(insideAPI, getNodeAdapter(parentPort));
  } else {
    expose(insideAPI);
  }
}
