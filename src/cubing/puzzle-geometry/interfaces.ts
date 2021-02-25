//   We don't want to introduce dependencies from alg or kpuzzle or other
//   tools into puzzle geometry, but we do want to interoperate with them.
//   This file contains interface declarations for some of the things we
//   use interoperably.  These definitions are not identical to those in
//   the corresponding classes but they are interoperable.

import { Turn, MoveQuantum } from "../alg";

export class PGVendoredMove extends Turn {}
export class PGVendoredMoveQuantum extends MoveQuantum {}

// export class PGVendoredMove {
//   public type: string = "blockMove";
//   public outerLayer?: number;
//   public innerLayer?: number;
//   constructor(
//     outerLayer: number | undefined,
//     innerLayer: number | undefined,
//     public family: string,
//     public amount: number = 1,
//   ) {
//     if (innerLayer) {
//       this.innerLayer = innerLayer;
//       if (outerLayer) {
//         this.outerLayer = outerLayer;
//       }
//     }
//     if (outerLayer && !innerLayer) {
//       throw new Error(
//         "Attempted to contruct block move with outer layer but no inner layer",
//       );
//     }
//   }
// }

export interface PGVendoredMoveNotation {
  lookupMove(move: PGVendoredMove): Transformation | undefined;
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
  moveNotation?: PGVendoredMoveNotation;
}
