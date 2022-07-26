import { join } from "path";

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
