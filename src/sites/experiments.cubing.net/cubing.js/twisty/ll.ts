import { Alg } from "../../../../cubing/alg";
import { OldKPuzzle, OldKPuzzleSVGWrapper } from "../../../../cubing/kpuzzle";
import { puzzles } from "../../../../cubing/puzzles";
import "../../../../cubing/twisty";

window.addEventListener("DOMContentLoaded", async () => {
  const def = await puzzles["3x3x3"].def();
  const llSVG = await puzzles["3x3x3"].llSVG!(); // TODO: Avoid the need for an assertion?
  const kpuzzle = new OldKPuzzle(def);

  {
    const svg = new OldKPuzzleSVGWrapper(def, llSVG);
    kpuzzle.reset();
    kpuzzle.applyAlg(Alg.fromString("R U R' U' R' F R2 U' R' U' R U R' F'"));
    svg.draw(def, kpuzzle.state);
    document.body.appendChild(svg.element);
  }

  {
    const svg = new OldKPuzzleSVGWrapper(def, llSVG);
    kpuzzle.reset();
    kpuzzle.applyAlg(Alg.fromString("((M' U')4 x y)3"));
    svg.draw(def, kpuzzle.state);
    document.body.appendChild(svg.element);
  }

  {
    const svg = new OldKPuzzleSVGWrapper(def, llSVG);
    kpuzzle.reset();
    kpuzzle.applyAlg(Alg.fromString("r U R' U R U2 r'"));
    svg.draw(def, kpuzzle.state);
    document.body.appendChild(svg.element);
  }
});
