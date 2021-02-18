// TODO: Remove all legacy exports.

import { parseKPuzzleDefinition } from "./parser";

/** @deprecated */
const parseKPuzzle = parseKPuzzleDefinition;
export { parseKPuzzle };

import { KPuzzleSVGWrapper } from "./svg";

/** @deprecated */
const SVG = KPuzzleSVGWrapper;
export { SVG };

import { Canonicalizer } from "./canonicalize";

/** @deprecated */
const Canonicalize = Canonicalizer;
export { Canonicalize };

import {
  combineTransformations,
  multiplyTransformations,
  identityTransformation,
  invertTransformation,
  areTransformationsEquivalent,
  areOrbitTransformationsEquivalent,
  areStatesEquivalient,
  transformationOrder,
} from "./transformations";

/** @deprecated */
const Combine = combineTransformations;
export { Combine };
/** @deprecated */
const Multiply = multiplyTransformations;
export { Multiply };
/** @deprecated */
const Invert = invertTransformation;
export { Invert };
/** @deprecated */
const IdentityTransformation = identityTransformation;
export { IdentityTransformation };
/** @deprecated */
const EquivalentTransformations = areTransformationsEquivalent;
export { EquivalentTransformations };
/** @deprecated */
const EquivalentOrbitTransformations = areOrbitTransformationsEquivalent;
export { EquivalentOrbitTransformations };
/** @deprecated */
const EquivalentStates = areStatesEquivalient;
export { EquivalentStates };
/** @deprecated */
const Order = transformationOrder;
export { Order };
