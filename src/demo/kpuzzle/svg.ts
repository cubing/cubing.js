import { Alg } from "../../cubing/alg";
import {
  KPuzzle,
  KPuzzleDefinition,
  KPuzzleSVGWrapper,
} from "../../cubing/kpuzzle";
import { puzzles } from "../../cubing/puzzles";

class SVGDisplay {
  private svg: KPuzzleSVGWrapper;
  private kpuzzle: KPuzzle;
  constructor(private def: KPuzzleDefinition, svg: string) {
    this.svg = new KPuzzleSVGWrapper(def, svg);
    this.kpuzzle = new KPuzzle(this.def);
  }

  public element(): HTMLElement {
    return this.svg.element;
  }

  public setAlg(alg: Alg): void {
    this.kpuzzle.reset();
    this.kpuzzle.applyAlg(alg);
    this.svg.drawKPuzzle(this.kpuzzle);
  }
}

(async () => {
  const puzzle = puzzles["3x3x3"];
  const svgDisplay = new SVGDisplay(await puzzle.def(), await puzzle.svg());
  document.body.appendChild(svgDisplay.element());
  svgDisplay.setAlg(Alg.fromString("R U R'"));
})();
