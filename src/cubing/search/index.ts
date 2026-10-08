// TODO: handle centers properly.
export { random333Pattern } from "./inside/solve/puzzles/3x3x3/index.ts";
export {
  experimentalSolve2x2x2,
  experimentalSolve3x3x3IgnoringCenters,
  setSearchDebug,
  solveMegaminx,
  solvePyraminx,
  solveSkewb,
  solveTwips as experimentalSolveTwips,
} from "./outside.ts";

import { solveTwips as experimentalSolveTwips } from "./outside.ts";

/** @deprecated */
export const experimentalSolveTwsearch: typeof experimentalSolveTwips = (
  ...args
) => {
  console.error(
    "`experimentalSolveTwsearch(…)` is deprecated. Please call `experimentalSolveTwips(…)` instead.",
  );
  return experimentalSolveTwips(...args);
};
