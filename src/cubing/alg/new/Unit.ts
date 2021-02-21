import { OldUnit } from "../algorithm";
import { Bunch } from "./Bunch";
import { Move } from "./Move";

export type Unit = OldUnit & (Bunch | Move); // TODO: remove `OldUnit`
