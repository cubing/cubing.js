//  This interface defines how BlockTurns are transformed into
//  Transformations.

import { Transformation } from "./definition_types";
import { Turn } from "../alg";

export interface TurnNotation {
  lookupTurn(turn: Turn): Transformation | undefined;
}
