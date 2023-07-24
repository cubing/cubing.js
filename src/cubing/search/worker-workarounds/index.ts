import { exposeAPI } from "./worker-guard";

export async function searchWorkerURLImportMetaResolve(): Promise<string> {
  // Note:
  // - We have to hardcode the expected path of the entry file in the ESM build, due to lack of `esbuild` support: https://github.com/evanw/esbuild/issues/2866
  //   - This URL is based on the assumption that the code from this file ends up in a shared chunk in the `esm` build. This is not guaranteed by `esbuild`, but it consistently happens for our codebase.
  // - We inline the value (instead of using a constant), to maximize compatibility for hardcoded syntax detection in bundlers.
  // - `import.meta.resolve(…)` returns a sync result in every environment except `bun`: https://loadeverything.net/#compatibility-dashboard
  //   - We assume that it's `async`, just in case.
  // @ts-ignore
  return import.meta.resolve("./search-worker-entry.js");
}

export function searchWorkerURLNewURLImportMetaURL(): URL {
  // Note:
  // - We have to hardcode the expected path of the entry file in the ESM build, due to lack of `esbuild` support: https://github.com/evanw/esbuild/issues/795
  //   - This URL is based on the assumption that the code from this file ends up in a shared chunk in the `esm` build. This is not guaranteed by `esbuild`, but it consistently happens for our codebase.
  // - We inline the value (instead of using a constant), to maximize compatibility for hardcoded syntax detection in bundlers.
  return new URL("./search-worker-entry.js", import.meta.url);
}

// Workaround for `esbuild`: https://github.com/evanw/esbuild/issues/312#issuecomment-1092195778
export async function searchWorkerURLEsbuildWorkaround(): Promise<string> {
  exposeAPI.expose = false;
  return (await import("./search-worker-entry.js")).WORKER_ENTRY_FILE_URL;
}

export function instantiateSearchWorkerURLNewURLImportMetaURL(): Worker {
  return new Worker(new URL("./search-worker-entry.js", import.meta.url), {
    type: "module",
  });
}
