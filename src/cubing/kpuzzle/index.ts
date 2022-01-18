export type {
  KPuzzleDefinition as OldKPuzzleDefinition,
  OrbitTransformation as OldOrbitTransformation,
  Transformation as OldTransformation,
} from "./definition_types";

export {
  KPuzzle as OldKPuzzle,
  transformationForMove as oldTransformationForMove,
} from "./kpuzzle";

export {
  Canonicalizer as OldCanonicalizer,
  SearchSequence as OldSearchSequence,
  CanonicalSequenceIterator as OldCanonicalSequenceIterator,
} from "./canonicalize";

export {
  combineTransformations as oldCombineTransformations,
  multiplyTransformations as oldMultiplyTransformations,
  identityTransformation as oldIdentityTransformation,
  invertTransformation as oldInvertTransformation,
  areTransformationsEquivalent as oldAreTransformationsEquivalent,
  areOrbitTransformationsEquivalent as oldAreOrbitTransformationsEquivalent,
  areStatesEquivalent as oldAreStatesEquivalent,
  transformationOrder as oldTransformationOrder,
} from "./transformations";

export { parseKPuzzleDefinition as oldParseKPuzzleDefinition } from "./parser";

export { KPuzzleSVGWrapper as OldKPuzzleSVGWrapper } from "./svg";

export { cube3x3x3KPuzzle as oldExperimentalCube3x3x3KPuzzle } from "./3x3x3/3x3x3.kpuzzle.json";
export { experimentalIs3x3x3Solved as oldExperimentalIs3x3x3Solved } from "./puzzle-orientation";

export { transformationForQuantumMove as oldExperimentalTransformationForQuantumMove } from "./kpuzzle";
