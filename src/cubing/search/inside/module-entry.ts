if (!(globalThis as any).DO_NOT_EXPOSE_API) {
  (async () => {
    await import("./entry.js");
    self.postMessage("comlink-exposed");
  })();
}

export const WORKER_ENTRY_FILE_URL = import.meta.url;
