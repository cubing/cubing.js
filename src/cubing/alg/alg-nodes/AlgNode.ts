import type { Grouping } from "./containers/Grouping";
import type { LineComment } from "./leaves/LineComment";
import type { Commutator } from "./containers/Commutator";
import type { Conjugate } from "./containers/Conjugate";
import type { Move } from "./leaves/Move";
import type { Newline } from "./leaves/Newline";
import type { Pause } from "./leaves/Pause";

// TODO: Just `AlgLeaf`?
export type AlgLeafNode = Move | LineComment | Newline | Pause;

/** @category Alg */
export type AlgNode = AlgLeafNode | Grouping | Conjugate | Commutator;
