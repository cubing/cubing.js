import type { BuildOptions } from "esbuild";
import type { IterableElement } from "../../lib/vendor/type-fest";
import { packageNames } from "./packageNames";
import { SRC_CUBING, TYPESCRIPT_INDEX } from "./paths";

export const packageEntryPoints: string[] = packageNames.map(
  (p) => SRC_CUBING.join(p, TYPESCRIPT_INDEX).path,
);

export const searchWorkerEsbuildWorkaroundEntry: IterableElement<
  BuildOptions["entryPoints"]
> = {
  in: SRC_CUBING.join("./search/worker-workarounds/search-worker-entry.js")
    .path,
  // esbuild automatically adds `.js`
  // https://esbuild.github.io/api/#entry-points
  out: "chunks/search-worker-entry",
};

export const packageEntryPointsWithSearchWorkerEntry: BuildOptions["entryPoints"] =
  // @ts-expect-error: TypeScript can't seem to reconcile the types, no matter how much we annotate.
  packageEntryPoints.concat([searchWorkerEsbuildWorkaroundEntry]);
