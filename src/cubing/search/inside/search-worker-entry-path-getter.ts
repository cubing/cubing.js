import { exposeAPI } from "./worker-guard";

exposeAPI.expose = false;
export async function getWorkerEntryFileURL() {
  return (await import("./search-worker-entry")).WORKER_ENTRY_FILE_URL;
}
