// import type {
//   FaceletMeshStickeringMask,
//   PieceStickeringMask,
//   StickeringMask,
// } from "./mask";

import {
  ExperimentalPieceStickering,
  type ExperimentalPieceStickeringMask,
  type ExperimentalStickeringMask,
  experimentalGetPieceStickeringMask,
} from "../../../../../puzzles/cubing-private";

const charMap: Record<string, ExperimentalPieceStickering> = {
  "-": ExperimentalPieceStickering.Regular,
  D: ExperimentalPieceStickering.Dim,
  I: ExperimentalPieceStickering.Ignored,
  // o: ExperimentalPieceStickering.OrientationStickers, // TODO: hack for centers
  X: ExperimentalPieceStickering.Invisible,
  O: ExperimentalPieceStickering.IgnoreNonPrimary, // orient color known
  P: ExperimentalPieceStickering.PermuteNonPrimary, // Example: PLL
  o: ExperimentalPieceStickering.Ignoriented, // Example: LL edges during CLS
  "?": ExperimentalPieceStickering.OrientationWithoutPermutation, // ACube: ignore position
  M: ExperimentalPieceStickering.Mystery, // This piece needs highlighting, but we know nothing about it.
  "@": ExperimentalPieceStickering.Regular, // ACube: ignore orientation // TODO: distinguish from "regular"
};

export function parseSerializedStickeringMask(
  serializedStickeringMask: string,
): ExperimentalStickeringMask {
  const stickeringMask: ExperimentalStickeringMask = {
    orbits: {},
  };
  const serializedOrbits = serializedStickeringMask.split(",");
  for (const serializedOrbit of serializedOrbits) {
    const [orbitName, serializedOrbitPieces, ...rest] =
      serializedOrbit.split(":");
    if (rest.length > 0) {
      throw new Error(
        `Invalid serialized orbit stickering mask (too many colons): \`${serializedOrbit}\``,
      );
    }
    const pieces: ExperimentalPieceStickeringMask[] = [];
    stickeringMask.orbits[orbitName] = { pieces };
    for (const char of serializedOrbitPieces) {
      const pieceStickering = charMap[char];
      pieces.push(experimentalGetPieceStickeringMask(pieceStickering));
    }
  }
  return stickeringMask;
}
