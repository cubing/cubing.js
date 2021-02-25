//  This interface defines how BlockMoves are transformed into
//  Transformations.

import { Transformation } from "./definition_types";
import { Turn } from "../alg";

export interface MoveNotation {
  lookupMove(move: Turn): Transformation | undefined;
}
