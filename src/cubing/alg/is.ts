import { Alg } from "./Alg";
import {
  Commutator,
  Conjugate,
  Grouping,
  LineComment,
  Turn,
  Newline,
  Pause,
} from "./units";

export function experimentalIs(
  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  v: any,
  c:
    | typeof Alg
    | typeof Grouping
    | typeof LineComment
    | typeof Commutator
    | typeof Conjugate
    | typeof Turn
    | typeof Newline
    | typeof Pause,
): boolean {
  return v instanceof c;
}
// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export function experimentalIsUnit(v: any): boolean {
  return (
    experimentalIs(v, Grouping) ||
    experimentalIs(v, LineComment) ||
    experimentalIs(v, Commutator) ||
    experimentalIs(v, Conjugate) ||
    experimentalIs(v, Turn) ||
    experimentalIs(v, Newline) ||
    experimentalIs(v, Pause)
  );
}
