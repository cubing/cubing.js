/**
 * For a walkthrough, see:
 *
 * https://js.cubing.net/cubing/alg/
 *
 * @packageDocumentation
 */

export { Alg } from "./Alg.ts";
export { AlgBuilder } from "./AlgBuilder.ts";
export type { AlgBranch, AlgLeaf, AlgNode } from "./alg-nodes/AlgNode.ts";
export type { GroupingModifications } from "./alg-nodes/containers/Grouping.ts";
export * from "./alg-nodes/index.ts";
export type { MoveModifications } from "./alg-nodes/leaves/Move.ts";
export { setAlgDebug } from "./debug.ts";
export { Example } from "./example.ts";
export { experimentalIs } from "./is.ts";
export { keyToMove } from "./keyboard.ts";
// TODO: Find a better way to track parsed algs.
export type { Parsed as ExperimentalParsed } from "./parseAlg.ts";
export type {
  ExperimentalNotationType,
  ExperimentalSerializationOptions,
} from "./SerializationOptions.ts";
export type {
  AppendCancelOptions,
  PuzzleSpecificSimplifyOptions,
  SimplifyOptions,
} from "./simplify/index.ts";
export { experimentalAppendMove } from "./simplify/index.ts";
export {
  functionFromTraversal,
  TraversalDownUp,
  TraversalUp,
} from "./traversal.ts";
export type { AlgCubingNetOptions } from "./url.ts";
export { experimentalAlgCubingNetLink } from "./url.ts";
