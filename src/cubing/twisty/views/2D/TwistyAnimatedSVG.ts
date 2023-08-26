import type { KPuzzle } from "../../../kpuzzle";
import type { KPattern } from "../../../kpuzzle/KPattern";
import type {
  FaceletMeshStickeringMask,
  StickeringMask,
} from "../../../puzzles/stickerings/mask"; // TODO

const xmlns = "http://www.w3.org/2000/svg";
const DATA_COPY_ID_ATTRIBUTE = "data-copy-id";

// Unique ID mechanism to keep SVG gradient element IDs unique. TODO: Is there
// something more performant, and that can't be broken by other elements of the
// page? (And also doesn't break if this library is run in parallel.)
let svgCounter = 0;
function nextSVGID(): string {
  svgCounter += 1;
  return `svg${svgCounter.toString()}`;
}

// TODO: This is hardcoded to 3x3x3 SVGs
const colorMaps: Partial<
  Record<FaceletMeshStickeringMask, string | Record<string, string>>
> = {
  dim: {
    white: "#dddddd",
    orange: "#884400",
    limegreen: "#008800",
    red: "#660000",
    "rgb(34, 102, 255)": "#000088", // TODO
    yellow: "#888800",
    "rgb(102, 0, 153)": "rgb(50, 0, 76)",
    purple: "#3f003f",
  },
  oriented: "#44ddcc",
  ignored: "#555555",
  invisible: "#00000000",
};

export class TwistyAnimatedSVG {
  public wrapperElement: HTMLElement;
  public svgElement: SVGElement;
  public gradientDefs: SVGDefsElement;
  private originalColors: { [type: string]: string } = {};
  private gradients: { [type: string]: SVGGradientElement } = {};
  private svgID: string;
  constructor(
    public kpuzzle: KPuzzle,
    svgSource: string,
    experimentalStickeringMask?: StickeringMask,
    private showUnknownOrientations: boolean = false,
  ) {
    if (!svgSource) {
      throw new Error(`No SVG definition for puzzle type: ${kpuzzle.name()}`);
    }

    this.svgID = nextSVGID();

    this.wrapperElement = document.createElement("div");
    this.wrapperElement.classList.add("svg-wrapper");
    // TODO: Sanitization.
    this.wrapperElement.innerHTML = svgSource;

    const svgElem = this.wrapperElement.querySelector("svg");
    if (!svgElem) {
      throw new Error("Could not get SVG element");
    }
    this.svgElement = svgElem;
    if (xmlns !== svgElem.namespaceURI) {
      throw new Error("Unexpected XML namespace");
    }
    svgElem.style.maxWidth = "100%";
    svgElem.style.maxHeight = "100%";
    this.gradientDefs = document.createElementNS(xmlns, "defs");
    svgElem.insertBefore(this.gradientDefs, svgElem.firstChild);

    for (const orbitDefinition of kpuzzle.definition.orbits) {
      for (let idx = 0; idx < orbitDefinition.numPieces; idx++) {
        for (
          let orientation = 0;
          orientation < orbitDefinition.numOrientations;
          orientation++
        ) {
          const id = this.elementID(
            orbitDefinition.orbitName,
            idx,
            orientation,
          );
          const elem = this.elementByID(id);

          let originalColor: string = elem?.style.fill;
          /// TODO: Allow setting stickering mask dynamically.
          if (experimentalStickeringMask) {
            (() => {
              // TODO: dedup with Cube3D,,factor out fallback calculations
              const a = experimentalStickeringMask.orbits;
              if (!a) {
                return;
              }
              const orbitStickeringMask = a[orbitDefinition.orbitName];
              if (!orbitStickeringMask) {
                return;
              }
              const pieceStickeringMask = orbitStickeringMask.pieces[idx];
              if (!pieceStickeringMask) {
                return;
              }
              const faceletStickeringMasks =
                pieceStickeringMask.facelets[orientation];
              if (!faceletStickeringMasks) {
                return;
              }
              const stickeringMask =
                typeof faceletStickeringMasks === "string"
                  ? faceletStickeringMasks
                  : faceletStickeringMasks?.mask;
              const colorMap = colorMaps[stickeringMask];
              if (typeof colorMap === "string") {
                originalColor = colorMap;
              } else if (colorMap) {
                originalColor = colorMap[originalColor];
              }
            })();
          } else {
            originalColor = elem?.style.fill;
          }
          this.originalColors[id] = originalColor;
          this.gradients[id] = this.newGradient(id, originalColor);
          this.gradientDefs.appendChild(this.gradients[id]);
          elem?.setAttribute("style", `fill: url(#grad-${this.svgID}-${id})`);
        }
      }
    }

    for (const hintElem of Array.from(
      svgElem.querySelectorAll(`[${DATA_COPY_ID_ATTRIBUTE}]`),
    )) {
      const id = hintElem.getAttribute(DATA_COPY_ID_ATTRIBUTE);
      hintElem.setAttribute("style", `fill: url(#grad-${this.svgID}-${id})`);
    }

    if (this.showUnknownOrientations) {
      this.drawPattern(this.kpuzzle.defaultPattern());
    }
  }

  public drawPattern(
    pattern: KPattern,
    nextPattern?: KPattern,
    fraction?: number,
  ): void {
    this.draw(pattern, nextPattern, fraction);
  }

  // TODO: save definition in the constructor?
  public draw(
    pattern: KPattern,
    nextPattern?: KPattern,
    fraction?: number,
  ): void {
    const nextTransformation = nextPattern?.experimentalToTransformation();
    if (!pattern) {
      throw new Error("Distinguishable pieces are not handled for SVG yet!");
    }

    for (const orbitDefinition of pattern.kpuzzle.definition.orbits) {
      const currentPatternOrbit =
        pattern.patternData[orbitDefinition.orbitName];
      const nextTransformationOrbit = nextTransformation
        ? nextTransformation.transformationData[orbitDefinition.orbitName]
        : null;
      for (let idx = 0; idx < orbitDefinition.numPieces; idx++) {
        for (
          let orientation = 0;
          orientation < orbitDefinition.numOrientations;
          orientation++
        ) {
          const id = this.elementID(
            orbitDefinition.orbitName,
            idx,
            orientation,
          );
          const fromCur = this.elementID(
            orbitDefinition.orbitName,
            currentPatternOrbit.pieces[idx],
            (orbitDefinition.numOrientations -
              currentPatternOrbit.orientation[idx] +
              orientation) %
              orbitDefinition.numOrientations,
          );
          let singleColor = false;
          if (nextTransformationOrbit) {
            const fromNext = this.elementID(
              orbitDefinition.orbitName,
              nextTransformationOrbit.permutation[idx],
              (orbitDefinition.numOrientations -
                nextTransformationOrbit.orientationDelta[idx] +
                orientation) %
                orbitDefinition.numOrientations,
            );
            if (fromCur === fromNext) {
              singleColor = true; // TODO: Avoid redundant work during move.
            }
            fraction = fraction || 0; // TODO Use the type system to tie this to nextPattern?
            const easedBackwardsPercent =
              100 * (1 - fraction * fraction * (2 - fraction * fraction)); // TODO: Move easing up the stack.
            this.gradients[id].children[0].setAttribute(
              "stop-color",
              this.originalColors[fromCur],
            );
            this.gradients[id].children[0].setAttribute(
              "offset",
              `${Math.max(easedBackwardsPercent - 5, 0)}%`,
            );
            this.gradients[id].children[1].setAttribute(
              "offset",
              `${Math.max(easedBackwardsPercent - 5, 0)}%`,
            );
            this.gradients[id].children[2].setAttribute(
              "offset",
              `${easedBackwardsPercent}%`,
            );
            this.gradients[id].children[3].setAttribute(
              "offset",
              `${easedBackwardsPercent}%`,
            );
            this.gradients[id].children[3].setAttribute(
              "stop-color",
              this.originalColors[fromNext],
            );
          } else {
            singleColor = true; // TODO: Avoid redundant work during move.
          }
          if (singleColor) {
            if (
              this.showUnknownOrientations &&
              currentPatternOrbit.orientationMod?.[idx] === 1
            ) {
              this.gradients[id].children[0].setAttribute("stop-color", "#000");
              this.gradients[id].children[0].setAttribute("offset", "5%");
              this.gradients[id].children[1].setAttribute("offset", "5%");
              this.gradients[id].children[2].setAttribute("offset", "20%");
              this.gradients[id].children[3].setAttribute("offset", "20%");
              this.gradients[id].children[3].setAttribute(
                "stop-color",
                this.originalColors[fromCur],
              );
            } else {
              this.gradients[id].children[0].setAttribute(
                "stop-color",
                this.originalColors[fromCur],
              );
              this.gradients[id].children[0].setAttribute("offset", "100%");
              this.gradients[id].children[1].setAttribute("offset", "100%");
              this.gradients[id].children[2].setAttribute("offset", "100%");
              this.gradients[id].children[3].setAttribute("offset", "100%");
            }
          }
          // this.gradients[id]
          // this.elementByID(id).style.fill = this.originalColors[from];
        }
      }
    }
  }

  private newGradient(id: string, originalColor: string): SVGGradientElement {
    const grad = document.createElementNS(
      xmlns,
      "radialGradient",
    ) as SVGGradientElement;
    grad.setAttribute("id", `grad-${this.svgID}-${id}`);
    grad.setAttribute("r", "70.7107%"); // TODO: Adapt to puzzle.
    const stopDefs = [
      { offset: 0, color: originalColor },
      { offset: 0, color: "black" },
      { offset: 0, color: "black" },
      { offset: 0, color: originalColor },
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

  private elementID(
    orbitName: string,
    idx: number,
    orientation: number,
  ): string {
    return `${orbitName}-l${idx}-o${orientation}`;
  }

  private elementByID(id: string): HTMLElement {
    // TODO: Use classes and scope selector to SVG element.
    return this.wrapperElement.querySelector(`#${id}`) as HTMLElement;
  }
}
