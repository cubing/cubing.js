import type { Worker as NodeWorker } from "node:worker_threads";
import { wrap } from "comlink";
import { PortableWorker } from "comlink/examples/portable-worker";
import type { WorkerAPI } from "./inside/api";
import { searchOutsideDebugGlobals } from "./outside";
import {
  searchWorkerURLEsbuildWorkaround,
  searchWorkerURLImportMetaResolve,
  searchWorkerURLNewURLImportMetaURL,
} from "./worker-workarounds";

function wrapAPI(worker: Worker | NodeWorker): WorkerAPI {
  return wrap<WorkerAPI>(worker);
}

async function instantiateModuleWorker(
  workerEntryFileURL: string | URL,
): Promise<WorkerAPI> {
  // biome-ignore lint/suspicious/noAsyncPromiseExecutor: TODO
  return new Promise<WorkerAPI>(async (resolve, reject) => {
    try {
      const worker = PortableWorker(workerEntryFileURL);

      // TODO: Remove this once we can remove the workarounds for lack of `import.meta.resolve(…)` support.
      const onFirstMessage = (messageData: string) => {
        if (messageData === "comlink-exposed") {
          // We need to clear the timeout so that we don't prevent `node` from exiting in the meantime.
          resolve(wrapAPI(worker));
        } else {
          reject(
            new Error(`wrong module instantiation message ${messageData}`),
          );
        }
      };

      const onError = (e: ErrorEvent) => {
        reject(e);
      };

      if ("once" in worker /* hack to detect `node` */) {
        // We have to use `once` so the `unref()` from `comlink-everywhere` allows the process to quit as expected.
        worker.once("message", onFirstMessage);
      } else {
        worker.addEventListener("error", onError, {
          once: true,
        });
        worker.addEventListener(
          "message",
          (e: MessageEvent) => onFirstMessage(e.data),
          {
            once: true,
          },
        );
      }
    } catch (e) {
      reject(e);
    }
  });
}

export const allWorkerAPIPromises: Promise<WorkerAPI>[] = [];

export async function instantiateWorkerAPI(): Promise<WorkerAPI> {
  const workerAPIPromise = instantiateWorkerImplementation();
  allWorkerAPIPromises.push(workerAPIPromise);
  const insideAPI = await workerAPIPromise;
  insideAPI.setDebugMeasurePerf(searchOutsideDebugGlobals.logPerf);
  insideAPI.setScramblePrefetchLevel(
    searchOutsideDebugGlobals.scramblePrefetchLevel,
  );
  return workerAPIPromise;
}

type FallbackStrategyInfo = [
  fn: () => Promise<WorkerAPI>,
  description: string,
  warnOnSuccess: null | string,
];

async function instantiateWorkerImplementation(): Promise<WorkerAPI> {
  if (globalThis.location?.protocol === "file:") {
    console.warn(
      "This current web page is loaded from the local filesystem (a URL that starts with `file://`). In this situation, `cubing.js` may be unable to generate scrambles or perform searches in some browsers. See: https://js.cubing.net/cubing/scramble/#file-server-required",
    );
  }

  function failed(methodDescription?: string) {
    return `Module worker instantiation${
      methodDescription ? ` ${methodDescription}` : ""
    } failed`;
  }

  const importMetaResolveStrategy: FallbackStrategyInfo = [
    async () => instantiateModuleWorker(searchWorkerURLImportMetaResolve()),
    "using `import.meta.resolve(…)",
    null,
  ];
  const esbuildWorkaroundStrategy: FallbackStrategyInfo = [
    async () =>
      instantiateModuleWorker(await searchWorkerURLEsbuildWorkaround()),
    "using the `esbuild` workaround",
    // TODO: we will hopefully discontinue the `esbuild` workaround at some
    // point, but `esbuild` has been stuck for 3 years on this issue. Because
    // `esbuild` and Vite (which uses `esbuild`) are now dominating the
    // ecosystem, this just causes a warning for a lot of devs/users that they
    // can't do anything about. As frustrating as the situation is, the
    // workaround is semantically fine (even if it's convoluted) and is
    // preserved by `esbuild`-based flows in practice. So we suppress the
    // warning in the medium-term but maintain long-term hope that we can
    // remove it (and the other fallbacks as well).
    null,
  ];
  const newURLStrategy: FallbackStrategyInfo = [
    async () => instantiateModuleWorker(searchWorkerURLNewURLImportMetaURL()),
    "using `new URL(…, import.meta.url)`",
    "will",
  ];

  const fallbackOrder: FallbackStrategyInfo[] =
    searchOutsideDebugGlobals.prioritizeEsbuildWorkaroundForWorkerInstantiation
      ? [esbuildWorkaroundStrategy, importMetaResolveStrategy, newURLStrategy]
      : [importMetaResolveStrategy, esbuildWorkaroundStrategy, newURLStrategy];

  for (const [fn, description, warnOnSuccess] of fallbackOrder) {
    try {
      const worker = await fn();
      if (warnOnSuccess) {
        if (searchOutsideDebugGlobals.showWorkerInstantiationWarnings) {
          console.warn(
            `Module worker instantiation required ${description}. \`cubing.js\` ${warnOnSuccess} not support this fallback in the future.`,
          );
        }
      }
      return worker;
    } catch {
      // if (searchOutsideDebugGlobals.showWorkerInstantiationWarnings) {
      //   console.warn(`${failed(description)}, falling back.`);
      // }
    }
  }

  throw new Error(`${failed()}. There are no more fallbacks available.`);
}
