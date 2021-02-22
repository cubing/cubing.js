//  This interface defines how BlockMoves are transformed into
//  Transformations.

import { Transformation } from "./definition_types";
import { Move } from "../alg";

export interface MoveNotation {
  lookupMove(move: Move): Transformation | undefined;
}
