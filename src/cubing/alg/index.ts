/**
 * For a walkthrough, see:
 *
 * https://js.cubing.net/cubing/alg/
 *
 * @packageDocumentation
 */

export { Alg } from "./Alg";
export * from "./alg-nodes";
export type { MoveModifications } from "./alg-nodes/leaves/Move";
export { AlgBuilder } from "./AlgBuilder";
export { Example } from "./example";
export { keyToMove } from "./keyboard";
export {
  TraversalDownUp,
  TraversalUp,
  functionFromTraversal,
} from "./traversal";

export type { AlgBranch, AlgLeaf, AlgNode } from "./alg-nodes/AlgNode";

export { experimentalAlgCubingNetLink } from "./url";
export type { AlgCubingNetOptions } from "./url";

export { experimentalIs } from "./is";
export { experimentalAppendMove } from "./simplify";
export type {
  AppendCancelOptions,
  PuzzleSpecificSimplifyOptions,
  SimplifyOptions,
} from "./simplify";

// TODO: Find a better way to track parsed algs.
export type { Parsed as ExperimentalParsed } from "./parseAlg";

export { setAlgDebug } from "./debug";

export type {
  ExperimentalNotationType,
  ExperimentalSerializationOptions,
} from "./SerializationOptions";
