import { Grouping } from "./containers/Grouping";
import { Comment } from "./leaves/Comment";
import { Commutator } from "./containers/Commutator";
import { Conjugate } from "./containers/Conjugate";
import { Move } from "./leaves/Move";
import { Newline } from "./leaves/Newline";
import { Pause } from "./leaves/Pause";

export type LeafUnit = Move | Comment | Newline | Pause;

export type Unit = LeafUnit | Grouping | Conjugate | Commutator;
