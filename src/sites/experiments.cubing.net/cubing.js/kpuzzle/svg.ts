import { Alg } from "../../../../cubing/alg/index.ts";
import type { KPuzzle } from "../../../../cubing/kpuzzle/index.ts";
import { puzzles } from "../../../../cubing/puzzles/index.ts";
import { ExperimentalSVGAnimator } from "../../../../cubing/twisty/index.ts";

class SVGDisplay {
  private svg: ExperimentalSVGAnimator;
  constructor(
    private kpuzzle: KPuzzle,
    svg: string,
  ) {
    this.svg = new ExperimentalSVGAnimator(kpuzzle, svg);
  }

  public element(): HTMLElement {
    return this.svg.wrapperElement;
  }

  public setAlg(alg: Alg): void {
    this.svg.draw(this.kpuzzle.algToTransformation(alg).toKPattern());
  }
}

const puzzle = puzzles["3x3x3"];
const svgDisplay = new SVGDisplay(await puzzle.kpuzzle(), await puzzle.svg());
document.body.appendChild(svgDisplay.element());
svgDisplay.setAlg(Alg.fromString("R U R'"));
