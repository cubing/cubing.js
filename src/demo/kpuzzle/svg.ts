import { parse, Sequence } from "../../cubing/alg";
import { KPuzzle, KPuzzleDefinition, Puzzles, SVG } from "../../cubing/kpuzzle";

class SVGDisplay {
  private svg: SVG;
  private kpuzzle: KPuzzle;
  constructor(private def: KPuzzleDefinition) {
    this.svg = new SVG(this.def);
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

const svgDisplay = new SVGDisplay(Puzzles["3x3x3"]);
document.body.appendChild(svgDisplay.element());
svgDisplay.setAlg(parse("R U R'"));
