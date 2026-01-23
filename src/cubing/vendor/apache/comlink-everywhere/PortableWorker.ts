import type { Worker as NodeWorker } from "node:worker_threads";

type WebWorkerOptions = ConstructorParameters<typeof globalThis.Worker>[1];
type NodeWorkerOptions = ConstructorParameters<typeof NodeWorker>[1];

type WorkerOptions = WebWorkerOptions & NodeWorkerOptions;

function isCrossOrigin(url: string | URL) {
  if (!globalThis.location) {
    return false;
  }
  const scriptOrigin = globalThis.location.origin;
  const workerOrigin = new URL(url, globalThis.location.href).origin;
  return scriptOrigin !== workerOrigin;
}

function constructPortableWebWorker(
  url: string | URL,
  workerOptions?: WebWorkerOptions,
) {
  const useTrampoline = isCrossOrigin(url);

  // We could use the trampoline unconditionally, but this would require adding
  // `blob:` to the CSP unnecessarily. So we avoid it when possible.
  if (useTrampoline) {
    // Needed until something like
    // https://github.com/lgarron/worker-execution-origin or
    // https://github.com/whatwg/html/issues/6911 is available in all browser.
    const trampolineSource = `import ${JSON.stringify(url.toString())};`;
    const blob = new Blob([trampolineSource], {
      type: "text/javascript",
    });

    url = URL.createObjectURL(blob);
  }

  const worker = new globalThis.Worker(url, {
    ...workerOptions,
    type: "module",
  });

  if (useTrampoline) {
    const originalTerminate = worker.terminate.bind(worker);
    Object.defineProperty(worker, "terminate", {
      get() {
        // @ts-expect-error: TypeScript is not powerful enough to infer that `url` is always a string in this code path.
        URL.revokeObjectURL(url);
        originalTerminate();
      },
    });
  }

  return worker;
}

function constructNodeStyleWorker(
  url: URL | string,
  workerOptions?: NodeWorkerOptions,
) {
  // We could theoretically use dynamic import, but:
  //
  // - 1. There is no synchronous way to do this conditionally. We can't do it
  //      synchronously in a constructor, and while top-level `await` is
  //      well-supported in runtimes it's not as easy to use with bundlers.
  // 2.  `.getBuiltinModule(…)` signals more clearly that these are strictly
  //      runtime dependencies.
  const { Worker: NodeWorker } = globalThis.process.getBuiltinModule(
    "node:worker_threads",
  );

  // `import.meta.resolve(…)` is the recommended way to get the path to a
  // relative file to pass to the worker constructor. This returns a `file://…`
  // URL as a string, which `bun` and `deno` accept for the worker constructor
  // but `node` does not. We can detect this and convert it to a `URL` to allow
  // more concise, idiomatic code across all platforms.
  url =
    typeof url === "string" && url.startsWith("file://") ? new URL(url) : url;

  return new NodeWorker(url, workerOptions);
}

interface GlobalThisWithMaybeUnreffableWorker {
  Worker?: {
    prototype: {
      unref?: () => void;
    };
  };
}

function constructPortableWorker(
  url: string | URL,
  workerOptions?: WorkerOptions,
): Worker | NodeWorker {
  const hasWebWorkers = globalThis.Worker;
  const hasBuiltinModules = !!globalThis.process?.getBuiltinModule;

  if (hasWebWorkers && !hasBuiltinModules) {
    // Browsers
    return constructPortableWebWorker(url, workerOptions) as Worker &
      Record<Exclude<keyof NodeWorker, keyof Worker>, undefined>;
  }

  // Note that optional chaining *should* allow us to access `.unref` rather than
  const webWorkersHaveUnref = (
    globalThis as GlobalThisWithMaybeUnreffableWorker
  ).Worker?.prototype.unref;

  if (hasWebWorkers && hasBuiltinModules && webWorkersHaveUnref) {
    // `bun`
    return constructPortableWebWorker(url, workerOptions);
  } else {
    // `node` and `deno`
    return constructNodeStyleWorker(url, workerOptions);
  }
}

interface PortableWorkerConstructor {
  new (url: string | URL, workerOptions?: WorkerOptions): Worker | NodeWorker;
}

// @ts-expect-error: Type wrangling
export const PortableWorker: PortableWorkerConstructor =
  constructPortableWorker;

/** This type is useful to cast `Worker | NodeWorker` into a type where methods like `.unref?.()` can be called. */
export type WebWorkerOrNodeWorker =
  | (Worker & Record<Exclude<keyof NodeWorker, keyof Worker>, undefined>)
  | (NodeWorker & Record<Exclude<keyof Worker, keyof NodeWorker>, undefined>);
