import { Grouping } from "./containers/Grouping";
import { LineComment } from "./leaves/LineComment";
import { Commutator } from "./containers/Commutator";
import { Conjugate } from "./containers/Conjugate";
import { Move } from "./leaves/Move";
import { Newline } from "./leaves/Newline";
import { Pause } from "./leaves/Pause";

export type LeafUnit = Move | LineComment | Newline | Pause;

export type Unit = LeafUnit | Grouping | Conjugate | Commutator;
