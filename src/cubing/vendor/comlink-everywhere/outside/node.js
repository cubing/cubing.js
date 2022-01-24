// Mangled so that bundlers don't try to inline the source.
const worker_threads_mangled = "w-orker-_threa-ds";
const worker_threads_unmangled = () => worker_threads_mangled.replace(/-/g, "");

async function getImports() {
  return {
    NodeWorker: (await import(worker_threads_unmangled())).Worker,
    nodeEndpoint: (await import("comlink/dist/esm/node-adapter.mjs")).default,
  };
}

function construct(imports, url, nodeOptions) {
  const worker = new imports.NodeWorker(url, nodeOptions);
  // Avoid holding up the entire program exit if only workers are running.
  // https://nodejs.org/api/worker_threads.html#worker_threads_broadcastchannel_unref
  worker.unref();
  const wrappedWorker = imports.nodeEndpoint(worker);
  wrappedWorker.nodeWorker = worker; // TODO
  return wrappedWorker;
}

let cachedNodeWorkerWrapper = null;
export async function NodeWorkerWrapper() {
  const imports = await getImports();
  return (
    cachedNodeWorkerWrapper ||
    (cachedNodeWorkerWrapper = class {
      constructor(url, _options) {
        return construct(imports, url);
      }
    })
  );
}

let cachedNodeWorkerStringWrapper = null;
export async function NodeWorkerStringWrapper() {
  const imports = await getImports();
  return (
    cachedNodeWorkerStringWrapper ||
    (cachedNodeWorkerStringWrapper = class {
      constructor(url, _options) {
        return construct(imports, url, { eval: true });
      }
    })
  );
}
