import { join } from "node:path";
import type { BuildOptions } from "esbuild";
import type { IterableElement } from "../../lib/vendor/type-fest";

export const packageNames = [
  "alg",
  "bluetooth",
  "kpuzzle",
  "notation",
  "protocol",
  "puzzle-geometry",
  "puzzles",
  "scramble",
  "stream",
  "search",
  "twisty",
];

export const packageEntryPoints: string[] = packageNames.map((p) =>
  join("src/cubing/", p, "/index.ts"),
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
  // @ts-ignore: TypeScript can't seem to reconcile the types, no matter how much we annotate.
  packageEntryPoints.concat([searchWorkerEsbuildWorkaroundEntry]);
