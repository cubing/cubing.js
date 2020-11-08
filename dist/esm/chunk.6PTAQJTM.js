import {
  cubeKeyMapping
} from "./chunk.KHJLFQEA.js";

// src/alg/keyboard.ts
function keyToMove(e) {
  if (e.altKey || e.ctrlKey) {
    return null;
  }
  return cubeKeyMapping[e.keyCode] || null;
}

export {
  keyToMove
};
//# sourceMappingURL=chunk.P6CAM3QO.js.map
