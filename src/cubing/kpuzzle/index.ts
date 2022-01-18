import { KPuzzle } from "./KPuzzle";
export { KPuzzle };
export type { KTransformation } from "./KTransformation";
export {
  KPuzzleDefinition,
  KTransformationData,
  KStateData,
} from "./KPuzzleDefinition";

import { cube3x3x3KPuzzleDefinition } from "./3x3x3/3x3x3.kpuzzle.json";
export const experimental3x3x3KPuzzle = new KPuzzle(cube3x3x3KPuzzleDefinition);

export type {
  OldKPuzzleDefinition as OldKPuzzleDefinition,
  OldOrbitTransformation as OldOrbitTransformation,
  Transformation as OldTransformation,
} from "./old/definition_types";

export {
  OldKPuzzle,
  transformationForMove as oldTransformationForMove,
} from "./old/kpuzzle";

export {
  Canonicalizer as OldCanonicalizer,
  SearchSequence as OldSearchSequence,
  CanonicalSequenceIterator as OldCanonicalSequenceIterator,
} from "./old/canonicalize";

export {
  combineTransformations as oldCombineTransformations,
  multiplyTransformations as oldMultiplyTransformations,
  identityTransformation as oldIdentityTransformation,
  invertTransformation as oldInvertTransformation,
  areTransformationsEquivalent as oldAreTransformationsEquivalent,
  areOrbitTransformationsEquivalent as oldAreOrbitTransformationsEquivalent,
  areStatesEquivalent as oldAreStatesEquivalent,
  transformationOrder as oldTransformationOrder,
} from "./old/transformations";

export { parseKPuzzleDefinition as oldParseKPuzzleDefinition } from "./old/parser";

export { KPuzzleSVGWrapper as OldKPuzzleSVGWrapper } from "./old/svg";

export { experimentalIs3x3x3Solved as oldExperimentalIs3x3x3Solved } from "./3x3x3/puzzle-orientation";

export { transformationForQuantumMove as oldExperimentalTransformationForQuantumMove } from "./old/kpuzzle";
