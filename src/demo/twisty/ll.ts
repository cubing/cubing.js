import { parseAlg } from "../../cubing/alg/index";
import { KPuzzle, Puzzles, SVG } from "../../cubing/kpuzzle";
import "../../cubing/twisty/dom/TwistyPlayer";

window.addEventListener("load", () => {
  const def = Puzzles["3x3x3LL"];
  const kpuzzle = new KPuzzle(def);

  {
    const svg = new SVG(def);
    kpuzzle.reset();
    kpuzzle.applyAlg(parseAlg("R U R' U' R' F R2 U' R' U' R U R' F'"));
    svg.draw(def, kpuzzle.state);
    document.body.appendChild(svg.element);
  }

  {
    const svg = new SVG(def);
    kpuzzle.reset();
    kpuzzle.applyAlg(parseAlg("((M' U')4 x y)3"));
    svg.draw(def, kpuzzle.state);
    document.body.appendChild(svg.element);
  }

  {
    const svg = new SVG(def);
    kpuzzle.reset();
    kpuzzle.applyAlg(parseAlg("r U R' U R U2 r'"));
    svg.draw(def, kpuzzle.state);
    document.body.appendChild(svg.element);
  }
});
