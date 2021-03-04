//   We don't want to introduce dependencies from alg or kpuzzle or other
//   tools into puzzle geometry, but we do want to interoperate with them.
//   This file contains interface declarations for some of the things we
//   use interoperably.  These definitions are not identical to those in
//   the corresponding classes but they are interoperable.

import { Move } from "../alg";

export interface MoveNotation {
  lookupMove(move: Move): Transformation | undefined;
}

export interface PGVendoredOrbitTransformation {
  permutation: number[];
  orientation: number[];
}

export type Transformation = Record<string, PGVendoredOrbitTransformation>;

export interface PGVendoredOrbitDefinition {
  numPieces: number;
  orientations: number;
}

export interface PGVendoredKPuzzleDefinition {
  name: string;
  orbits: { [key: string]: PGVendoredOrbitDefinition };
  startPieces: Transformation;
  moves: { [key: string]: Transformation };
  svg?: string;
  moveNotation?: MoveNotation;
}
