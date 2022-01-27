(globalThis as any).DO_NOT_EXPOSE_API = true;

export async function getWorkerEntryFileURL() {
  return (await import("./search-worker-entry")).WORKER_ENTRY_FILE_URL;
}
