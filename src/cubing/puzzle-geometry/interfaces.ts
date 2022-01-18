import type { Move } from "../alg";
import type { KTransformation } from "../kpuzzle";

export interface MoveNotation {
  lookupMove(move: Move): KTransformation | undefined;
}
