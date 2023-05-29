import { exposeAPI } from "./worker-guard";

export async function searchWorkerURLImportMetaResolve(): Promise<string> {
  // This returns a sync result in every environment except `bun`: https://loadeverything.net/#compatibility-dashboard
  // @ts-ignore
  return import.meta.resolve("./search-worker-entry.js");
}

export function searchWorkerURLNewURLImportMetaURL(): URL {
  return new URL("./search-worker-entry.js", import.meta.url);
}

// Workaround for `esbuild`: https://github.com/evanw/esbuild/issues/312#issuecomment-1092195778
export async function searchWorkerURLEsbuildWorkaround(): Promise<string> {
  exposeAPI.expose = false;
  return (await import("./search-worker-entry")).WORKER_ENTRY_FILE_URL;
}
