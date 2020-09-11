//   We don't want to introduce dependencies from alg or kpuzzle or other
//   tools into puzzle geometry, but we do want to interoperate with them.
//   This file contains interface declarations for some of the things we
//   use interoperably.  These definitions are not identical to those in
//   the corresponding classes but they are interoperable.

export class BlockMove {
  public type: string = "blockMove";
  public outerLayer?: number;
  public innerLayer?: number;
  constructor(
    outerLayer: number | undefined,
    innerLayer: number | undefined,
    public family: string,
    public amount: number = 1,
  ) {
    if (innerLayer) {
      this.innerLayer = innerLayer;
      if (outerLayer) {
        this.outerLayer = outerLayer;
      }
    }
    if (outerLayer && !innerLayer) {
      throw new Error(
        "Attempted to contruct block move with outer layer but no inner layer",
      );
    }
  }
}

export interface MoveNotation {
  lookupMove(move: BlockMove): Transformation | undefined;
}

export interface OrbitTransformation {
  permutation: number[];
  orientation: number[];
}

export type Transformation = Record<string, OrbitTransformation>;

export interface OrbitDefinition {
  numPieces: number;
  orientations: number;
}

export interface KPuzzleDefinition {
  name: string;
  orbits: { [key: string]: OrbitDefinition };
  startPieces: Transformation;
  moves: { [key: string]: Transformation };
  svg?: string;
  moveNotation?: MoveNotation;
}
