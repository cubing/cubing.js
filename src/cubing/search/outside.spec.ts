import { expect, test } from "bun:test";
import { KPattern } from "../kpuzzle";
import { experimentalCountMetricMoves } from "../notation";
import { CommonMetric } from "../notation/commonMetrics";
import { cube3x3x3 } from "../puzzles";
import { solveTwsearch } from "./outside";

test("`solveTwsearch(…)` can use `targetPattern`", async () => {
  const kpuzzle = await cube3x3x3.kpuzzle();
  const maskOLL = new KPattern(kpuzzle, {
    EDGES: {
      pieces: [0, 0, 0, 0, 4, 5, 6, 7, 8, 9, 10, 11],
      orientation: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    },
    CORNERS: {
      pieces: [0, 0, 0, 0, 4, 5, 6, 7],
      orientation: [0, 0, 0, 0, 0, 0, 0, 0],
    },
    CENTERS: {
      pieces: [0, 1, 2, 3, 4, 5],
      orientation: [0, 0, 0, 0, 0, 0],
      orientationMod: [1, 1, 1, 1, 1, 1],
    },
  });
  const scramble = maskOLL.applyAlg("R' U' R' F R F' U R");
  const sol = await solveTwsearch(kpuzzle, scramble, {
    targetPattern: maskOLL,
    generatorMoves: ["U", "L", "F", "R"],
  });
  expect(
    experimentalCountMetricMoves(
      cube3x3x3,
      CommonMetric.OuterBlockTurnMetric,
      sol,
    ),
  ).toEqual(6);
});

test("`solveTwsearch(…)` can use `maxDepth`", async () => {
  const kpuzzle = await cube3x3x3.kpuzzle();
  const scramble = kpuzzle.defaultPattern().applyAlg("R U R' F' U2 L'");
  const sol = await solveTwsearch(kpuzzle, scramble, {
    generatorMoves: ["U", "L", "F", "R"],
  });
  expect(
    experimentalCountMetricMoves(
      cube3x3x3,
      CommonMetric.OuterBlockTurnMetric,
      sol,
    ),
  ).toEqual(4);
  expect(() =>
    solveTwsearch(kpuzzle, scramble, {
      generatorMoves: ["U", "L", "F", "R"],
      maxDepth: 3,
    }),
  ).toThrow("No solution found!");
});
