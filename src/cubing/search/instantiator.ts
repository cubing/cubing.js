import {
  constructWorkerFromString,
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
      const importSrc = `import "${workerEntryFileURL}";`;
      const blob = new Blob([importSrc], {
        type: "text/javascript",
      });
      const worker = new Worker(URL.createObjectURL(blob), { type: "module" });
      worker.addEventListener(
        "error",
        (e) => {
          if (e.message.startsWith("SyntaxError")) {
            reject(e);
          }
        },
        { once: true },
      );
      worker.addEventListener("message", (e) => {
        if (e.data === "comlink-exposed") {
          resolve(wrap<WorkerInsideAPI>(worker));
        } else {
          reject(new Error("wrong module instantiation message"));
        }
      }),
        {
          once: true,
        };
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
