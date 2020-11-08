import {
  BlockMove
} from "./chunk.KHJLFQEA.js";

// src/alg/operation.ts
function modifiedBlockMove(original, modifications) {
  return new BlockMove(modifications.outerLayer ?? original.outerLayer, modifications.innerLayer ?? original.innerLayer, modifications.family ?? original.family, modifications.amount ?? original.amount);
}

export {
  modifiedBlockMove
};
//# sourceMappingURL=chunk.VGLAJU64.js.map
