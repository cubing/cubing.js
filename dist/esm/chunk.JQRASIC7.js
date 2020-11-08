import {
  Combine
} from "./chunk.OXN3TMHE.js";

// src/kpuzzle/svg.ts
const xmlns = "http://www.w3.org/2000/svg";
let svgCounter = 0;
function nextSVGID() {
  svgCounter += 1;
  return "svg" + svgCounter.toString();
}
class SVG {
  constructor(kPuzzleDefinition) {
    this.kPuzzleDefinition = kPuzzleDefinition;
    this.originalColors = {};
    this.gradients = {};
    if (!kPuzzleDefinition.svg) {
      throw new Error(`No SVG definition for puzzle type: ${kPuzzleDefinition.name}`);
    }
    this.svgID = nextSVGID();
    this.element = document.createElement("div");
    this.element.classList.add("svg-wrapper");
    this.element.innerHTML = kPuzzleDefinition.svg;
    const svgElem = this.element.querySelector("svg");
    if (!svgElem) {
      throw new Error("Could not get SVG element");
    }
    if (xmlns !== svgElem.namespaceURI) {
      throw new Error("Unexpected XML namespace");
    }
    svgElem.style.maxWidth = "100%";
    svgElem.style.maxHeight = "100%";
    this.gradientDefs = document.createElementNS(xmlns, "defs");
    svgElem.insertBefore(this.gradientDefs, svgElem.firstChild);
    for (const orbitName in kPuzzleDefinition.orbits) {
      const orbitDefinition = kPuzzleDefinition.orbits[orbitName];
      for (let idx = 0; idx < orbitDefinition.numPieces; idx++) {
        for (let orientation = 0; orientation < orbitDefinition.orientations; orientation++) {
          const id = this.elementID(orbitName, idx, orientation);
          const elem = this.elementByID(id);
          const originalColor = elem.style.fill;
          this.originalColors[id] = originalColor;
          this.gradients[id] = this.newGradient(id, originalColor);
          this.gradientDefs.appendChild(this.gradients[id]);
          elem.setAttribute("style", `fill: url(#grad-${this.svgID}-${id})`);
        }
      }
    }
  }
  drawKPuzzle(kpuzzle, nextState, fraction) {
    this.draw(kpuzzle.definition, kpuzzle.state, nextState, fraction);
  }
  draw(definition, state, nextState, fraction) {
    for (const orbitName in definition.orbits) {
      const orbitDefinition = definition.orbits[orbitName];
      const curOrbitState = state[orbitName];
      const nextOrbitState = nextState ? nextState[orbitName] : null;
      for (let idx = 0; idx < orbitDefinition.numPieces; idx++) {
        for (let orientation = 0; orientation < orbitDefinition.orientations; orientation++) {
          const id = this.elementID(orbitName, idx, orientation);
          const fromCur = this.elementID(orbitName, curOrbitState.permutation[idx], (orbitDefinition.orientations - curOrbitState.orientation[idx] + orientation) % orbitDefinition.orientations);
          let singleColor = false;
          if (nextOrbitState) {
            const fromNext = this.elementID(orbitName, nextOrbitState.permutation[idx], (orbitDefinition.orientations - nextOrbitState.orientation[idx] + orientation) % orbitDefinition.orientations);
            if (fromCur === fromNext) {
              singleColor = true;
            }
            fraction = fraction || 0;
            const easedBackwardsPercent = 100 * (1 - fraction * fraction * (2 - fraction * fraction));
            this.gradients[id].children[0].setAttribute("stop-color", this.originalColors[fromCur]);
            this.gradients[id].children[1].setAttribute("stop-color", this.originalColors[fromCur]);
            this.gradients[id].children[1].setAttribute("offset", `${Math.max(easedBackwardsPercent - 5, 0)}%`);
            this.gradients[id].children[2].setAttribute("offset", `${Math.max(easedBackwardsPercent - 5, 0)}%`);
            this.gradients[id].children[3].setAttribute("offset", `${easedBackwardsPercent}%`);
            this.gradients[id].children[4].setAttribute("offset", `${easedBackwardsPercent}%`);
            this.gradients[id].children[4].setAttribute("stop-color", this.originalColors[fromNext]);
            this.gradients[id].children[5].setAttribute("stop-color", this.originalColors[fromNext]);
          } else {
            singleColor = true;
          }
          if (singleColor) {
            this.gradients[id].children[0].setAttribute("stop-color", this.originalColors[fromCur]);
            this.gradients[id].children[1].setAttribute("stop-color", this.originalColors[fromCur]);
            this.gradients[id].children[1].setAttribute("offset", `100%`);
            this.gradients[id].children[2].setAttribute("offset", `100%`);
            this.gradients[id].children[3].setAttribute("offset", `100%`);
            this.gradients[id].children[4].setAttribute("offset", `100%`);
          }
        }
      }
    }
  }
  newGradient(id, originalColor) {
    const grad = document.createElementNS(xmlns, "radialGradient");
    grad.setAttribute("id", `grad-${this.svgID}-${id}`);
    grad.setAttribute("r", `70.7107%`);
    const stopDefs = [
      {offset: 0, color: originalColor},
      {offset: 0, color: originalColor},
      {offset: 0, color: "black"},
      {offset: 0, color: "black"},
      {offset: 0, color: originalColor},
      {offset: 100, color: originalColor}
    ];
    for (const stopDef of stopDefs) {
      const stop = document.createElementNS(xmlns, "stop");
      stop.setAttribute("offset", `${stopDef.offset}%`);
      stop.setAttribute("stop-color", stopDef.color);
      stop.setAttribute("stop-opacity", "1");
      grad.appendChild(stop);
    }
    return grad;
  }
  elementID(orbitName, idx, orientation) {
    return orbitName + "-l" + idx + "-o" + orientation;
  }
  elementByID(id) {
    return this.element.querySelector("#" + id);
  }
}

// src/kpuzzle/transformations.ts
function EquivalentTransformations(def, t1, t2) {
  for (const orbitName in def.orbits) {
    const oDef = def.orbits[orbitName];
    const o1 = t1[orbitName];
    const o2 = t2[orbitName];
    for (let idx = 0; idx < oDef.numPieces; idx++) {
      if (o1.orientation[idx] !== o2.orientation[idx]) {
        return false;
      }
      if (o1.permutation[idx] !== o2.permutation[idx]) {
        return false;
      }
    }
  }
  return true;
}
function EquivalentStates(def, t1, t2) {
  return EquivalentTransformations(def, Combine(def, def.startPieces, t1), Combine(def, def.startPieces, t2));
}

export {
  SVG,
  EquivalentTransformations,
  EquivalentStates
};
//# sourceMappingURL=chunk.4XYPLKQR.js.map
