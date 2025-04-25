/**
 * For a walkthrough, see:
 *
 * https://js.cubing.net/cubing/alg/
 *
 * @packageDocumentation
 */

export { Alg } from "./Alg";
export { AlgBuilder } from "./AlgBuilder";
export * from "./alg-nodes";
export type { AlgBranch, AlgLeaf, AlgNode } from "./alg-nodes/AlgNode";
export type { MoveModifications } from "./alg-nodes/leaves/Move";
export { setAlgDebug } from "./debug";
export { Example } from "./example";
export { experimentalIs } from "./is";
export { keyToMove } from "./keyboard";
// TODO: Find a better way to track parsed algs.
export type { Parsed as ExperimentalParsed } from "./parseAlg";
export type {
  ExperimentalNotationType,
  ExperimentalSerializationOptions,
} from "./SerializationOptions";
export type {
  AppendCancelOptions,
  PuzzleSpecificSimplifyOptions,
  SimplifyOptions,
} from "./simplify";
export { experimentalAppendMove } from "./simplify";
export {
  functionFromTraversal,
  TraversalDownUp,
  TraversalUp,
} from "./traversal";
export type { AlgCubingNetOptions } from "./url";
export { experimentalAlgCubingNetLink } from "./url";
