import {
  constructWorker,
  wrap,
} from "../vendor/apache/comlink-everywhere/outside";
import type { WorkerInsideAPI } from "./inside/api";
import { searchOutsideDebugGlobals } from "./outside";
import {
  instantiateSearchWorkerURLNewURLImportMetaURL,
  searchWorkerURLEsbuildWorkaround,
  searchWorkerURLImportMetaResolve,
  searchWorkerURLNewURLImportMetaURL,
} from "./worker-workarounds";

export interface WorkerOutsideAPI {
  terminate: () => void; // `node` can return a `Promise` with an exit code, but we match the web worker API.
}
export interface InsideOutsideAPI {
  insideAPI: WorkerInsideAPI;
  outsideAPI: WorkerOutsideAPI;
}

function probablyCrossOrigin(workerEntryFileURL: URL): boolean {
  try {
    const scriptOrigin = globalThis.location?.origin;
    const workerOrigin = workerEntryFileURL.origin;
    return !!scriptOrigin && !!workerOrigin && scriptOrigin !== workerOrigin;
  } catch {
    return false;
  }
}

async function instantiateModuleWorker(
  workerEntryFileURL: string | URL,
): Promise<InsideOutsideAPI> {
  // We need the `import.meta.url` base for `bun`.
  const url = new URL(workerEntryFileURL, import.meta.url);
  const tryTrampolineFirst = probablyCrossOrigin(url);
  try {
    return instantiateModuleWorkerAttempt(url, tryTrampolineFirst);
  } catch {
    return instantiateModuleWorkerAttempt(url, !tryTrampolineFirst);
  }
}

interface BunWorker extends Worker {
  unref?: () => void;
}

async function instantiateModuleWorkerAttempt(
  workerEntryFileURL: URL,
  crossOriginTrampoline: boolean,
): Promise<InsideOutsideAPI> {
  // biome-ignore lint/suspicious/noAsyncPromiseExecutor: TODO
  return new Promise<InsideOutsideAPI>(async (resolve, reject) => {
    try {
      if (!workerEntryFileURL) {
        reject(new Error("Could not get worker entry file URL."));
      }
      let url: URL = workerEntryFileURL;
      if (crossOriginTrampoline) {
        // Standard browser-like environment.
        const importSrc = `import ${JSON.stringify(
          workerEntryFileURL.toString(),
        )};`;
        const blob = new Blob([importSrc], {
          type: "text/javascript",
        });
        url = new URL(URL.createObjectURL(blob));
      }

      const worker = (await constructWorker(url, {
        type: "module",
      })) as Worker & {
        nodeWorker?: import("worker_threads").Worker;
      } & BunWorker;

      worker.unref?.(); // Unref in `bun`.

      const onError = (e: ErrorEvent) => {
        reject(e);
      };

      // TODO: Remove this once we can remove the workarounds for lack of `import.meta.resolve(…)` support.
      const onFirstMessage = (messageData: string) => {
        if (messageData === "comlink-exposed") {
          // We need to clear the timeout so that we don't prevent `node` from exiting in the meantime.
          resolve(wrapWithTerminate(worker));
        } else {
          reject(
            new Error(`wrong module instantiation message ${messageData}`),
          );
        }
      };

      if (worker.nodeWorker) {
        // We have to use `once` so the `unref()` from `comlink-everywhere` allows the process to quit as expected.
        worker.nodeWorker.once("message", onFirstMessage);
      } else {
        worker.addEventListener("error", onError, {
          once: true,
        });
        worker.addEventListener("message", (e) => onFirstMessage(e.data), {
          once: true,
        });
      }
    } catch (e) {
      reject(e);
    }
  });
}

// Maybe some day if we work really hard, this code path can work:
// - in `node` (https://github.com/nodejs/node/issues/43583#issuecomment-1540025755)
// - for CDNs (https://github.com/tc39/proposal-module-expressions or https://github.com/whatwg/html/issues/6911)
export async function instantiateModuleWorkerDirectlyForBrowser(): Promise<InsideOutsideAPI> {
  // biome-ignore lint/suspicious/noAsyncPromiseExecutor: TODO
  return new Promise<InsideOutsideAPI>(async (resolve, reject) => {
    try {
      const worker = instantiateSearchWorkerURLNewURLImportMetaURL();

      const onError = (e: ErrorEvent) => {
        reject(e);
      };

      // TODO: Remove this once we can remove the workarounds for lack of `import.meta.resolve(…)` support.
      const onFirstMessage = (messageData: string) => {
        if (messageData === "comlink-exposed") {
          // We need to clear the timeout so that we don't prevent `node` from exiting in the meantime.
          resolve(wrapWithTerminate(worker));
        } else {
          reject(
            new Error(`wrong module instantiation message ${messageData}`),
          );
        }
      };

      worker.addEventListener("error", onError, {
        once: true,
      });
      worker.addEventListener("message", (e) => onFirstMessage(e.data), {
        once: true,
      });
    } catch (e) {
      reject(e);
    }
  });
}

function wrapWithTerminate(worker: Worker): InsideOutsideAPI {
  const insideAPI = wrap<WorkerInsideAPI>(worker);
  const terminate = worker.terminate.bind(worker);
  return { insideAPI, outsideAPI: { terminate } };
}

export const allInsideOutsideAPIPromises: Promise<InsideOutsideAPI>[] = [];

export async function instantiateWorker(): Promise<InsideOutsideAPI> {
  const insideOutsideAPIPromise = instantiateWorkerImplementation();
  allInsideOutsideAPIPromises.push(insideOutsideAPIPromise);
  const { insideAPI } = await insideOutsideAPIPromise;
  insideAPI.setDebugMeasurePerf(searchOutsideDebugGlobals.logPerf);
  insideAPI.setScramblePrefetchLevel(
    searchOutsideDebugGlobals.scramblePrefetchLevel,
  );
  return insideOutsideAPIPromise;
}

export async function mapToAllWorkers(
  f: (worker: InsideOutsideAPI) => void,
): Promise<void> {
  await Promise.all(
    allInsideOutsideAPIPromises.map((worker) => worker.then(f)),
  );
}

async function instantiateWorkerImplementation(): Promise<InsideOutsideAPI> {
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

  const fallbackOrder: [
    fn: () => Promise<InsideOutsideAPI>,
    description: string,
    warnOnSuccess: null | string,
  ][] = [
    [
      async () =>
        instantiateModuleWorker(await searchWorkerURLImportMetaResolve()),
      "using `import.meta.resolve(…)",
      null,
    ],
    // TODO: This fallback should be lower (because it's less portable), but we need to try it earlier to work around https://github.com/parcel-bundler/parcel/issues/9051
    [
      instantiateModuleWorkerDirectlyForBrowser,
      "using inline `new URL(…, import.meta.url)`",
      "may",
    ],
    [
      async () => instantiateModuleWorker(searchWorkerURLNewURLImportMetaURL()),
      "using `new URL(…, import.meta.url)`",
      "will",
    ],
    [
      async () =>
        instantiateModuleWorker(await searchWorkerURLEsbuildWorkaround()),
      "using the `esbuild` workaround",
      "will",
    ],
  ];

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
      if (searchOutsideDebugGlobals.showWorkerInstantiationWarnings) {
        console.warn(`${failed(description)}, falling back.`);
      }
    }
  }

  throw new Error(`${failed()}. There are no more fallbacks available.`);
}
