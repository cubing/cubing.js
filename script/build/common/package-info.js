import { join } from "node:path";

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

export const packageEntryPoints = packageNames.map((p) =>
  join("src/cubing/", p, "/index.ts"),
);

export const searchWorkerEsbuildWorkaroundEntry = {
  in: "src/cubing/search/worker-workarounds/search-worker-entry.js",
  // esbuild automatically adds `.js`
  // https://esbuild.github.io/api/#entry-points
  out: "chunks/search-worker-entry",
};

export const packageEntryPointsWithSearchWorkerEntry =
  packageEntryPoints.concat([searchWorkerEsbuildWorkaroundEntry]);
