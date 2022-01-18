import type { Move } from "../alg";
import type { OldTransformation } from "../kpuzzle";

export interface MoveNotation {
  lookupMove(move: Move): OldTransformation | undefined;
}
