import assert from "node:assert";
import { Path } from "path-class";
import { randomPermuteInPlace } from "random-uint-below";
import { packageNames } from "../../build/common/packageNames.ts";

const cubingSrcRootRelative = new Path("../../../src/cubing/");
const INDEX_TS = new Path("index.ts");

const imports = [
  ...packageNames.map((name) => new Path("./").join(name, INDEX_TS)),
  "./search/inside/solve/puzzles/dynamic/sgs-side-events/search-dynamic-sgs-side-events.ts",
  "./search/inside/solve/puzzles/dynamic/sgs-unofficial/search-dynamic-sgs-unofficial.ts",
  "./search/inside/solve/puzzles/dynamic/sq1/search-dynamic-solve-sq1.ts",
  "./search/inside/solve/puzzles/dynamic/fto/search-dynamic-solve-fto.ts",
  "./search/inside/solve/puzzles/dynamic/4x4x4/search-dynamic-solve-4x4x4.ts",
  "./search/inside/solve/puzzles/dynamic/master_tetraminx/search-dynamic-solve-master_tetraminx.ts",
  "./search/inside/solve/puzzles/dynamic/3x3x3/search-dynamic-solve-3x3x3.ts",
  "./search/inside/solve/puzzles/dynamic/kilominx/search-dynamic-solve-kilominx.ts",
  "./puzzles/implementations/dynamic/unofficial/puzzles-dynamic-unofficial.ts",
  "./puzzles/implementations/dynamic/side-events/puzzles-dynamic-side-events.ts",
  "./puzzles/implementations/dynamic/4x4x4/puzzles-dynamic-4x4x4.ts",
  "./puzzles/implementations/dynamic/3x3x3/puzzles-dynamic-3x3x3.ts",
  "./puzzles/implementations/dynamic/megaminx/puzzles-dynamic-megaminx.ts",
  "./twisty/heavy-code-imports/dynamic-entries/twisty-dynamic-3d.ts",
];

assert.equal(imports.length, 25);

/**
 * Successful loading should not depend on import order for these files. (There
 * is one place that we do rely on import order, which is the worker guard. But
 * we test that separately below.)
 *
 * If this randomization ever causes a failure, we almost certainly have a bug.
 */
randomPermuteInPlace(imports);

for (const path of imports) {
  const imported = await import(cubingSrcRootRelative.join(path).path);

  console.log(
    `Number of runtime exports for \`${path}\`:`,
    Object.keys(imported).length,
  );
}

/**
 * This exercises:
 *
 * - Worker instantiation
 * - WASM
 * - Worker reference counting (using `comlink-everywhere`)
 */
const { randomScrambleForEvent } = await import(
  "../../../src/cubing/scramble/index.ts"
);
(await randomScrambleForEvent("222")).log();
