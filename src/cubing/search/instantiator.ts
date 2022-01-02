import type { WorkerInsideAPI } from "./inside/api";

import {
  constructWorkerFromString,
  workerFileConstructor,
  wrap,
} from "../vendor/comlink-everywhere/outside";

import type { esmTestAPIImplementation } from "./esm-test-worker";
type ESMTestAPI = typeof esmTestAPIImplementation;

// Blocked on:
// - https://github.com/evanw/esbuild/issues/312
// - https://bugzilla.mozilla.org/show_bug.cgi?id=1558780
const TEST_RELATIVE_URL_WORKER = false;

export async function instantiateRelativeURLWorker(): Promise<void> {
  // eslint-disable-next-line no-async-promise-executor
  return new Promise(async (resolve, reject) => {
    setTimeout(() => {
      reject();
    }, 1000);

    const Worker = await workerFileConstructor();
    const worker = new Worker(new URL("./esm-test-worker.js", import.meta.url));
    const api = wrap<ESMTestAPI>(worker);

    if ((await api.test("to worker")) === "from worker") {
      resolve();
    } else {
      reject();
    }

    // TODO: terminate worker.
  });
}

export async function relativeURLWorkerTest(): Promise<void> {
  try {
    await instantiateRelativeURLWorker();
    console.info("Successful relative URL worker instantiation.");
  } catch (e) {
    console.warn(
      "WARNING: Could not instantiate and communicate with a relative URL worker. This means that your app may have issues with `cubing/solve` in the future.",
    );
  }
}

export async function instantiateWorker(): Promise<WorkerInsideAPI> {
  const { workerSource } = await import("./worker-inside-generated-string.js");
  // console.log({ workerSource });

  const worker = await constructWorkerFromString(workerSource);

  if (TEST_RELATIVE_URL_WORKER) {
    relativeURLWorkerTest(); // do not wait for the result
  }

  return wrap(worker);
}
