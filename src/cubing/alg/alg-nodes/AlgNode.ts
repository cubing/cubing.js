import type { Commutator } from "./containers/Commutator";
import type { Conjugate } from "./containers/Conjugate";
import type { Grouping } from "./containers/Grouping";
import type { LineComment } from "./leaves/LineComment";
import type { Move } from "./leaves/Move";
import type { Newline } from "./leaves/Newline";
import type { Pause } from "./leaves/Pause";

/** @category Alg Nodes */
export type AlgLeaf = Move | LineComment | Newline | Pause;
/** @category Alg Nodes */
export type AlgBranch = Grouping | Conjugate | Commutator;

/** @category Alg Nodes */
export type AlgNode = AlgLeaf | AlgBranch;
