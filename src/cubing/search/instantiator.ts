import {
  constructWorkerFromString,
  workerFileConstructor,
  wrap,
} from "../vendor/comlink-everywhere/outside";
import type { WorkerInsideAPI } from "./inside/api";
import { getWorkerEntryFileURL } from "./inside/module-entry-path-getter";

const MODULE_WORKER_TIMEOUT_MILLISECONDS = 5000;
export async function instantiateModuleWorker(): Promise<WorkerInsideAPI> {
  // eslint-disable-next-line no-async-promise-executor
  return new Promise<WorkerInsideAPI>(async (resolve, reject) => {
    try {
      const workerEntryFileURL = await getWorkerEntryFileURL();
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
      const Worker = await workerFileConstructor();
      const worker = new Worker(url, { type: "module" });
      const listener = (e: ErrorEvent) => {
        if (e.message?.startsWith("SyntaxError")) {
          reject(e);
        }
        // TODO: We remove the listener because the `node` adapter for `comlink` actually registered us for "message" instead(!). For now, we just clean up.
        // https://github.com/GoogleChromeLabs/comlink/issues/574
        worker.removeEventListener("error", listener);
      };
      worker.addEventListener("error", listener, { once: true });
      worker.addEventListener(
        "message",
        (e) => {
          if (e.data === "comlink-exposed") {
            resolve(wrap<WorkerInsideAPI>(worker));
          } else {
            reject(new Error("wrong module instantiation message"));
          }
        },
        {
          once: true,
        },
      );
      setTimeout(() => {
        reject(new Error("module instantiation timeout"));
      }, MODULE_WORKER_TIMEOUT_MILLISECONDS);
    } catch (e) {
      reject(e);
    }
  });
}

export async function instantiateWorker(): Promise<WorkerInsideAPI> {
  try {
    // `await` is important for `catch` to work.
    return await instantiateModuleWorker();
  } catch (e) {
    console.warn(
      "Could not instantiate module worker (this is expected in Firefox). Falling back to string worker.",
      e,
    );
    const { workerSource } = await import(
      "./worker-inside-generated-string.js"
    );
    const worker = await constructWorkerFromString(workerSource);
    return wrap(worker);
  }
}
