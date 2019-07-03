import {Transformation, KPuzzleDefinition} from "./spec"

var xmlns = "http://www.w3.org/2000/svg";

// Unique ID mechanism to keep SVG gradient element IDs unique. TODO: Is there
// something more performant, and that can't be broken by other elements of the
// page? (And also doesn't break if this library is run in parallel.)
var svgCounter = 0;
function nextSVGID(): string {
  svgCounter += 1;
  return "svg" + svgCounter.toString();
}

export class SVG {
  public element: HTMLElement;
  public gradientDefs: SVGDefsElement;
  private originalColors: {[type: string]: string} = {}
  private gradients: {[type: string]: SVGGradientElement} = {}
  private svgID: string
  constructor(public kPuzzleDefinition: KPuzzleDefinition) {
    if (!kPuzzleDefinition.svg) {
      throw `No SVG definition for puzzle type: ${kPuzzleDefinition.name}`
    }

    this.svgID = nextSVGID();

    this.element = document.createElement("div");
    this.element.classList.add("svg-wrapper");
    // TODO: Sanitization.
    this.element.innerHTML = kPuzzleDefinition.svg;

    var svgElem = this.element.querySelector("svg");
    if (!svgElem) {
      throw "Could not get SVG element";
    }
    if (xmlns !== svgElem.namespaceURI) {
      throw "Unexpected XML namespace";
    }
    this.gradientDefs = <SVGDefsElement>document.createElementNS(xmlns, "defs");
    svgElem.insertBefore(this.gradientDefs, svgElem.firstChild);

    for (var orbitName in kPuzzleDefinition.orbits) {
      var orbitDefinition = kPuzzleDefinition.orbits[orbitName];

      for (var idx = 0; idx < orbitDefinition.numPieces; idx++) {
        for (var orientation = 0; orientation < orbitDefinition.orientations; orientation++) {
          var id = this.elementID(orbitName, idx, orientation);
          var elem = this.elementByID(id);
          var originalColor = elem.style.fill as string;
          this.originalColors[id] = originalColor;
          this.gradients[id] = this.newGradient(id, originalColor);
          this.gradientDefs.appendChild(this.gradients[id]);
          elem.setAttribute("style", `fill: url(#grad-${this.svgID}-${id})`);
        }
      }
    }
  }

  private newGradient(id: string, originalColor: string): SVGGradientElement {
    var grad = <SVGGradientElement>document.createElementNS(xmlns, "radialGradient");
    grad.setAttribute("id", `grad-${this.svgID}-${id}`);
    grad.setAttribute("r", `70.7107%`); // TODO: Adapt to puzzle.
    var stopDefs = [
      {offset: 0, color: originalColor},
      {offset: 0, color: originalColor},
      {offset: 0, color: "black"},
      {offset: 0, color: "black"},
      {offset: 0, color: originalColor},
      {offset: 100, color: originalColor}
    ];
    for (var stopDef of stopDefs) {
      var stop = <SVGStopElement>document.createElementNS(xmlns,
        "stop");
      stop.setAttribute("offset", `${stopDef.offset}%`);
      stop.setAttribute("stop-color", stopDef.color);
      stop.setAttribute("stop-opacity", "1");
      grad.appendChild(stop);
    }
    return grad;
  }

  private elementID(orbitName: string, idx: number, orientation: number): string {
    return orbitName + "-l" + idx + "-o" + orientation;
  }

  private elementByID(id: string): HTMLElement {
    // TODO: Use classes and scope selector to SVG element.
    return this.element.querySelector("#" + id) as HTMLElement;
  }

  // TODO: save definition in the constructor?
  draw(definition: KPuzzleDefinition, state: Transformation, nextState?: Transformation, fraction?: number) {
    for (var orbitName in definition.orbits) {
      var orbitDefinition = definition.orbits[orbitName];

      var curOrbitState = state[orbitName];
      var nextOrbitState = nextState ? (nextState as Transformation)[orbitName] : null;
      for (var idx = 0; idx < orbitDefinition.numPieces; idx++) {
        for (var orientation = 0; orientation < orbitDefinition.orientations; orientation++) {
          var id = this.elementID(orbitName, idx, orientation);
          var fromCur = this.elementID(
            orbitName,
            curOrbitState.permutation[idx],
            (orbitDefinition.orientations - curOrbitState.orientation[idx] + orientation) % orbitDefinition.orientations
          );
          var singleColor = false;
          if (nextOrbitState) {
            var fromNext = this.elementID(
              orbitName,
              nextOrbitState.permutation[idx],
              (orbitDefinition.orientations - nextOrbitState.orientation[idx] + orientation) % orbitDefinition.orientations
            );
            if (fromCur === fromNext) {
              singleColor = true; // TODO: Avoid redundant work during move.
            }
            fraction = fraction || 0; // TODO Use the type system to tie this to nextState?
            var easedBackwardsPercent = 100 * (1 - fraction * fraction * (2 - fraction * fraction)); // TODO: Move easing up the stack.
            this.gradients[id].children[0].setAttribute("stop-color", this.originalColors[fromCur]);
            this.gradients[id].children[1].setAttribute("stop-color", this.originalColors[fromCur]);
            this.gradients[id].children[1].setAttribute("offset", `${Math.max(easedBackwardsPercent - 5, 0)}%`)
            this.gradients[id].children[2].setAttribute("offset", `${Math.max(easedBackwardsPercent - 5, 0)}%`)
            this.gradients[id].children[3].setAttribute("offset", `${easedBackwardsPercent}%`)
            this.gradients[id].children[4].setAttribute("offset", `${easedBackwardsPercent}%`)
            this.gradients[id].children[4].setAttribute("stop-color", this.originalColors[fromNext]);
            this.gradients[id].children[5].setAttribute("stop-color", this.originalColors[fromNext]);
          } else {
            singleColor = true; // TODO: Avoid redundant work during move.
          }
          if (singleColor) {
            this.gradients[id].children[0].setAttribute("stop-color", this.originalColors[fromCur]);
            this.gradients[id].children[1].setAttribute("stop-color", this.originalColors[fromCur]);
            this.gradients[id].children[1].setAttribute("offset", `100%`)
            this.gradients[id].children[2].setAttribute("offset", `100%`)
            this.gradients[id].children[3].setAttribute("offset", `100%`)
            this.gradients[id].children[4].setAttribute("offset", `100%`)
          }
          // this.gradients[id]
          // this.elementByID(id).style.fill = this.originalColors[from];
        }
      }
    }
  }
}
