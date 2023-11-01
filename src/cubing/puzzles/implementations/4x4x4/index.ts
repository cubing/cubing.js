import { KPuzzle } from "cubing/kpuzzle";
import {
  remapKPuzzleDefinition,
  remapSVG,
} from "../../../../sites/experiments.cubing.net/cubing.js/stub/stub";
import { CubePGPuzzleLoader } from "../../async/async-pg3d";
import { getCached } from "../../async/lazy-cached";
import type { PuzzleLoader } from "../../PuzzleLoader";

const cube4x4x4: PuzzleLoader = new CubePGPuzzleLoader({
  id: "4x4x4",
  fullName: "4×4×4 Cube",
});

cube4x4x4.llSVG = getCached(async () => {
  return (
    await import("../dynamic/4x4x4/puzzles-dynamic-4x4x4")
  ).cube4x4x4LLSVG;
});

const remapping = {
  CORNERS: {
    permutation: [1, 3, 6, 0, 4, 2, 7, 5],
    orientationDelta: [0, 0, 0, 0, 0, 0, 0, 0],
  },
  EDGES: {
    permutation: [
      15, //  0,
      21, //  1,
      10, //  2,
      6, //  3,
      22, //  4,
      20, //  5,
      9, //  6,
      17, //  7,
      0, //  8,
      1, //  9,
      14, // 10,
      23, // 11,
      2, // 12,
      4, // 13,
      12, // 14,
      7, // 15,
      18, // 16,
      13, // 17,
      19, // 18,
      11, // 19,
      3, // 20,
      5, // 21,
      8, // 22,
      16, // 23,
    ],
    orientationDelta: [
      0, // 0
      0, // 1
      0, // 2
      0, // 3
      1, // 4
      1, // 5
      1, // 6
      1, // 7
      1, // 8
      0, // 9
      1, // 10
      0, // 11
      1, // 12
      1, // 13
      0, // 14
      1, // 15
      1, // 16
      0, // 17
      1, // 18
      0, // 19
      0, // 20
      0, // 21
      0, // 22
      0, // 23
    ],
  },
  CENTERS: {
    permutation: [
      6, 15, 21, 10, 17, 22, 20, 9, 23, 0, 1, 14, 7, 2, 4, 12, 11, 18, 13, 19,
      16, 3, 5, 8,
    ],
    orientationDelta: [
      0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    ],
  },
};

const svgOld = cube4x4x4.svg();
const kpuzzleOld = cube4x4x4.kpuzzle();

cube4x4x4.svg = async () => {
  const kpuzzle = await kpuzzleOld;
  return remapSVG(await svgOld, kpuzzle.definition, remapping);
};

cube4x4x4.kpuzzle = async () => {
  const kpuzzle = await kpuzzleOld;
  const remapped = remapKPuzzleDefinition(kpuzzle.definition, remapping);
  remapped.derivedMoves = {
    u: "U 2U",
    Uw: "u",
    l: "L 2L",
    Lw: "l",
    f: "F 2F",
    Fw: "f",
    r: "R 2R",
    Rw: "r",
    b: "B 2B",
    Bw: "b",
    d: "D 2D",
    Dw: "d",
    x: "r l'",
    y: "u d'",
    z: "f b'",
  };
  console.log(remapped);
  return new KPuzzle(remapped);
};

export { cube4x4x4 };
