import {Move} from "./alg-part"

export type MoveFamily = string; // TODO: Convert to an enum with string mappings.

// TODO: Rename to `LetterMove`?
export class BlockMove extends Move {
  public type: string = "blockMove";

  // If `outerLayer` is set, `innerLayer` must also be set.
  public outerLayer?: number;
  public innerLayer?: number;
  constructor(outerLayer: number | undefined, innerLayer: number | undefined, public family: MoveFamily, public amount: number=1) {
    super();
    this.outerLayer = outerLayer;
    this.innerLayer = innerLayer;
    Object.freeze(this);
  }
}

export function BareBlockMove(family: MoveFamily, amount?: number): BlockMove {
  return new BlockMove(undefined, undefined, family, amount);
}

export function LayerBlockMove(innerLayer: number, family: MoveFamily, amount?: number): BlockMove {
  return new BlockMove(undefined, innerLayer, family, amount);
}

export function RangeBlockMove(outerLayer: number,innerLayer: number, family: MoveFamily, amount?: number): BlockMove {
  return new BlockMove(outerLayer, innerLayer, family, amount);
}
