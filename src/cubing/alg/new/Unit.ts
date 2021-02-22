import { Bunch } from "./Bunch";
import { Comment } from "./Comment";
import { Commutator } from "./Commutator";
import { Conjugate } from "./Conjugate";
import { Move } from "./Move";
import { Newline } from "./Newline";
import { Pause } from "./Pause";

export type LeafUnit = Move | Comment | Newline | Pause;

export type Unit = LeafUnit | Bunch | Conjugate | Commutator;
