import type { BuildOptions } from "esbuild";
import { Path } from "path-class";
import type { IterableElement } from "../../lib/vendor/type-fest";
import { packageNames } from "./packageNames";
import { TYPESCRIPT_INDEX } from "./paths";

export const packageEntryPoints: string[] = packageNames.map(
  (p) => new Path("src/cubing/").join(p, TYPESCRIPT_INDEX).path,
);

export const searchWorkerEsbuildWorkaroundEntry: IterableElement<
  BuildOptions["entryPoints"]
> = {
  in: "src/cubing/search/worker-workarounds/search-worker-entry.js",
  // esbuild automatically adds `.js`
  // https://esbuild.github.io/api/#entry-points
  out: "chunks/search-worker-entry",
};

export const packageEntryPointsWithSearchWorkerEntry: BuildOptions["entryPoints"] =
  // @ts-expect-error: TypeScript can't seem to reconcile the types, no matter how much we annotate.
  packageEntryPoints.concat([searchWorkerEsbuildWorkaroundEntry]);
