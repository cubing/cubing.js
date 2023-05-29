import {
  constructWorker,
  wrap,
} from "../vendor/apache/comlink-everywhere/outside";
import { insideAPI, type WorkerInsideAPI } from "./inside/api";
import { searchOutsideDebugGlobals } from "./outside";
import {
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

export async function instantiateModuleWorker(
  workerEntryFileURL: string | URL,
): Promise<InsideOutsideAPI> {
  // rome-ignore lint/suspicious/noAsyncPromiseExecutor: TODO
  return new Promise<InsideOutsideAPI>(async (resolve, reject) => {
    try {
      if (!workerEntryFileURL) {
        reject(new Error("Could not get worker entry file URL."));
      }
      let url: string | URL;
      if (globalThis.Worker) {
        // Standard browser-like environment.
        const importSrc = `import ${JSON.stringify(
          workerEntryFileURL.toString(),
        )};`;
        const blob = new Blob([importSrc], {
          type: "text/javascript",
        });
        url = URL.createObjectURL(blob);
      } else {
        // We need to keep the original entry file URL, but we have to wrap it in the `URL` class.
        url = new URL(workerEntryFileURL);
      }

      const worker = (await constructWorker(url, {
        type: "module",
      })) as Worker & {
        nodeWorker?: import("worker_threads").Worker;
      };

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

function wrapWithTerminate(worker: Worker): InsideOutsideAPI {
  const insideAPI = wrap<WorkerInsideAPI>(worker);
  const terminate = worker.terminate.bind(worker);
  return { insideAPI, outsideAPI: { terminate } };
}

export const allInsideOutsideAPIPromises: Promise<InsideOutsideAPI>[] = [];

export async function instantiateWorker(): Promise<InsideOutsideAPI> {
  const insideOutsideAPIPromise = instantiateWorkerImplementation();
  allInsideOutsideAPIPromises.push(insideOutsideAPIPromise);
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
  if (searchOutsideDebugGlobals.forceStringWorker) {
    console.warn("The `forceStringWorker` workaround is no longer supported.");
  }
  try {
    return await instantiateModuleWorker(
      await searchWorkerURLImportMetaResolve(),
    );
  } catch {
    console.warn(
      "Module worker instantiation using `import.meta.resolve(…)` failed, falling back.",
    );
  }

  try {
    return await instantiateModuleWorker(searchWorkerURLNewURLImportMetaURL());
  } catch {
    console.warn(
      "Module worker instantiation using `new URL(…, import.meta.url)` failed, falling back.",
    );
  }

  try {
    return await instantiateModuleWorker(
      await searchWorkerURLEsbuildWorkaround(),
    );
  } catch {
    console.warn(
      "Module worker instantiation using the `esbuild` workaround failed, falling back.",
    );
  }

  throw new Error(
    "Module worker instantiation failed. There are no more fallbacks available.",
  );
}
