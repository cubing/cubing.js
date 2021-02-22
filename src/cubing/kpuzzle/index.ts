export {
  KPuzzleDefinition,
  OrbitTransformation,
  Transformation,
} from "./definition_types";

export { KPuzzle, stateForMove } from "./kpuzzle";

export {
  Canonicalizer,
  SearchSequence,
  CanonicalSequenceIterator,
} from "./canonicalize";

export {
  combineTransformations,
  multiplyTransformations,
  identityTransformation,
  invertTransformation,
  areTransformationsEquivalent,
  areOrbitTransformationsEquivalent,
  areStatesEquivalient,
  transformationOrder,
} from "./transformations";

export { parseKPuzzleDefinition } from "./parser";

export { KPuzzleSVGWrapper } from "./svg";

// Legacy exports
export * from "./index-legacy";
