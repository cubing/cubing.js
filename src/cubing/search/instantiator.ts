import { constructWorker, wrap } from "../vendor/comlink-everywhere/outside";
import type { WorkerInsideAPI } from "./inside/api";
import { getWorkerEntryFileURL } from "./inside/search-worker-ts-entry-path-getter";

const MODULE_WORKER_TIMEOUT_MILLISECONDS = 5000;

let forceStringWorker: boolean = false;
export function setForceStringWorker(force: boolean): void {
  forceStringWorker = force;
}

export async function instantiateModuleWorker(): Promise<WorkerInsideAPI> {
  // eslint-disable-next-line no-async-promise-executor
  return new Promise<WorkerInsideAPI>(async (resolve, reject) => {
    const timeoutID = setTimeout(() => {
      reject(new Error("module instantiation timeout"));
    }, MODULE_WORKER_TIMEOUT_MILLISECONDS);

    try {
      const workerEntryFileURL = await getWorkerEntryFileURL();
      if (!workerEntryFileURL) {
        // This happens in `bundle-global`.
        reject(new Error("Could not get worker entry file URL."));
      }
      let url: string | URL;
      if (globalThis.Blob) {
        // Standard browser-like environment.
        const importSrc = `import "${workerEntryFileURL}";`;
        const blob = new Blob([importSrc], {
          type: "text/javascript",
        });
        url = URL.createObjectURL(blob);
      } else {
        // `node` doesn't have `Blob`. We can keep the original entry file URL there, but we have to wrap it.
        // Needed for `node`
        url = new URL(workerEntryFileURL);
      }

      const worker = (await constructWorker(url, {
        type: "module",
      })) as Worker & {
        nodeWorker?: import("worker_threads").Worker;
      };

      const onError = (e: ErrorEvent) => {
        // TODO: Remove fallback when Firefox implements module workers: https://bugzilla.mozilla.org/show_bug.cgi?id=1247687
        if (e.message?.startsWith("SyntaxError")) {
          reject(e);
        }
      };

      const onFirstMessage = (messageData: string) => {
        if (messageData === "comlink-exposed") {
          // We need to clear the timeout so that we don't prevent `node` from exiting in the meantime.
          clearTimeout(timeoutID);
          resolve(wrap<WorkerInsideAPI>(worker));
        } else {
          reject(
            new Error("wrong module instantiation message " + messageData),
          );
        }
      };

      if (worker.nodeWorker) {
        // We have to use `once` so the `unref()` from `comlink-everywhere` allows the process to quite as expected.
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

async function instantiateClassicWorker(): Promise<WorkerInsideAPI> {
  const { workerSource } = await import("./worker-inside-generated-string.js");
  const worker = await constructWorker(workerSource, { eval: true });
  return wrap(worker);
}

export async function instantiateWorker(): Promise<WorkerInsideAPI> {
  if (forceStringWorker) {
    console.warn(
      "Using the `forceStringWorker` workaround for search worker instantiation. This will require downloading significantly more code than necessary, but the functionality will be the same.",
    );
    return instantiateClassicWorker();
  }
  try {
    // `await` is important for `catch` to work.
    return await instantiateModuleWorker();
  } catch (e) {
    console.warn(
      "Could not instantiate module worker (this may happen in Firefox, with `bundle-global`, or when using Parcel). Falling back to string worker.",
      e,
    );
    return instantiateClassicWorker();
  }
}
