import type { Grouping } from "./containers/Grouping";
import type { LineComment } from "./leaves/LineComment";
import type { Commutator } from "./containers/Commutator";
import type { Conjugate } from "./containers/Conjugate";
import type { Move } from "./leaves/Move";
import type { Newline } from "./leaves/Newline";
import type { Pause } from "./leaves/Pause";

export type AlgLeaf = Move | LineComment | Newline | Pause;
export type AlgContainer = Grouping | Conjugate | Commutator;

/** @category Alg */
export type AlgNode = AlgLeaf | AlgContainer;
