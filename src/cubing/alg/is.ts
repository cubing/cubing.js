import type { Alg } from "./Alg";
import {
  Commutator,
  Conjugate,
  Grouping,
  LineComment,
  Move,
  Newline,
  Pause,
} from "./alg-nodes";

export function experimentalIs(
  v: any,
  c:
    | typeof Alg
    | typeof Grouping
    | typeof LineComment
    | typeof Commutator
    | typeof Conjugate
    | typeof Move
    | typeof Newline
    | typeof Pause,
): boolean {
  return v instanceof c;
}
export function experimentalIsAlgNode(v: any): boolean {
  return (
    experimentalIs(v, Grouping) ||
    experimentalIs(v, LineComment) ||
    experimentalIs(v, Commutator) ||
    experimentalIs(v, Conjugate) ||
    experimentalIs(v, Move) ||
    experimentalIs(v, Newline) ||
    experimentalIs(v, Pause)
  );
}
