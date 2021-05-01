import type { Grouping } from "./containers/Grouping";
import type { LineComment } from "./leaves/LineComment";
import type { Commutator } from "./containers/Commutator";
import type { Conjugate } from "./containers/Conjugate";
import type { Move } from "./leaves/Move";
import type { Newline } from "./leaves/Newline";
import type { Pause } from "./leaves/Pause";

export type LeafUnit = Move | LineComment | Newline | Pause;

export type Unit = LeafUnit | Grouping | Conjugate | Commutator;

// @ts-ignore https://github.com/snowpackjs/snowpack/discussions/1589#discussioncomment-130176
const _SNOWPACK_HACK = true;
