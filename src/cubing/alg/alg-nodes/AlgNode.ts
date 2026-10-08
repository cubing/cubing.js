import type { Commutator } from "./containers/Commutator.ts";
import type { Conjugate } from "./containers/Conjugate.ts";
import type { Grouping } from "./containers/Grouping.ts";
import type { LineComment } from "./leaves/LineComment.ts";
import type { Move } from "./leaves/Move.ts";
import type { Newline } from "./leaves/Newline.ts";
import type { Pause } from "./leaves/Pause.ts";

/** @category Alg Nodes */
export type AlgLeaf = Move | LineComment | Newline | Pause;
/** @category Alg Nodes */
export type AlgBranch = Grouping | Conjugate | Commutator;

/** @category Alg Nodes */
export type AlgNode = AlgLeaf | AlgBranch;
