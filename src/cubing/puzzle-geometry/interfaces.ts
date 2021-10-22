import type { Move } from "../alg";
import type { Transformation } from "../kpuzzle";

export interface MoveNotation {
  lookupMove(move: Move): Transformation | undefined;
}
