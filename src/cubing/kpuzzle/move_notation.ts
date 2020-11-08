//  This interface defines how BlockMoves are transformed into
//  Transformations.

import { Transformation } from "./definition_types";
import { BlockMove } from "../alg";

export interface MoveNotation {
  lookupMove(move: BlockMove): Transformation | undefined;
}
