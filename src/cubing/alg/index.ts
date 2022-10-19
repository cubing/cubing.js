/**
 * For a walkthrough, see:
 *
 * https://js.cubing.net/cubing/alg/
 *
 * @packageDocumentation
 */

export { Alg } from "./Alg";
export { AlgBuilder } from "./AlgBuilder";
export {
  TraversalDownUp,
  TraversalUp,
  functionFromTraversal,
} from "./traversal";
export { Example } from "./example";
export { keyToMove } from "./keyboard";
export * from "./alg-nodes";
export type { MoveModifications } from "./alg-nodes/leaves/Move";

export type { AlgLeaf, AlgBranch, AlgNode } from "./alg-nodes/AlgNode";

export { experimentalAlgCubingNetLink } from "./url";
export type { AlgCubingNetOptions } from "./url";

export { experimentalAppendMove } from "./simplify";
export type {
  PuzzleSpecificSimplifyOptions,
  SimplifyOptions,
  AppendCancelOptions,
} from "./simplify";
export { experimentalIs } from "./is";

// TODO: Find a better way to track parsed algs.
export type { Parsed as ExperimentalParsed } from "./parseAlg";

export { setAlgDebug } from "./debug";
