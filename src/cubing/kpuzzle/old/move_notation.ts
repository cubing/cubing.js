//  This interface defines how BlockMoves are transformed into
//  Transformations.

import type { Transformation } from "./definition_types";
import type { Move } from "../../alg";

export interface MoveNotation {
  lookupMove(move: Move): Transformation | undefined;
}
