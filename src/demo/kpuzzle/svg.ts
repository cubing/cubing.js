import { parseAlg, Sequence } from "../../cubing/alg";
import { KPuzzle, KPuzzleDefinition, SVG } from "../../cubing/kpuzzle";
import { puzzles } from "../../cubing/puzzles";

class SVGDisplay {
  private svg: SVG;
  private kpuzzle: KPuzzle;
  constructor(private def: KPuzzleDefinition, svg: string) {
    this.svg = new SVG(def, svg);
    this.kpuzzle = new KPuzzle(this.def);
  }

  public element(): HTMLElement {
    return this.svg.element;
  }

  public setAlg(s: Sequence): void {
    this.kpuzzle.reset();
    this.kpuzzle.applyAlg(s);
    this.svg.drawKPuzzle(this.kpuzzle);
  }
}

(async () => {
  const puzzle = puzzles["3x3x3"];
  const svgDisplay = new SVGDisplay(await puzzle.def(), await puzzle.svg());
  document.body.appendChild(svgDisplay.element());
  svgDisplay.setAlg(parseAlg("R U R'"));
})();
