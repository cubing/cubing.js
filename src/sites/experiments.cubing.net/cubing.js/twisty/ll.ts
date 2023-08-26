import { puzzles } from "../../../../cubing/puzzles";
import "../../../../cubing/twisty";
import { TwistyAnimatedSVG } from "../../../../cubing/twisty/views/2D/TwistyAnimatedSVG";

window.addEventListener("DOMContentLoaded", async () => {
  const kpuzzle = await puzzles["3x3x3"].kpuzzle();
  const llSVG = await puzzles["3x3x3"].llSVG!(); // TODO: Avoid the need for an assertion?

  {
    const svg = new TwistyAnimatedSVG(kpuzzle, llSVG);
    const pattern = kpuzzle
      .algToTransformation("R U R' U' R' F R2 U' R' U' R U R' F'")
      .toKPattern();
    svg.draw(pattern);
    document.body.appendChild(svg.wrapperElement);
  }

  {
    const svg = new TwistyAnimatedSVG(kpuzzle, llSVG);
    const pattern = kpuzzle.algToTransformation("((M' U')4 x y)3").toKPattern();
    svg.draw(pattern);
    document.body.appendChild(svg.wrapperElement);
  }

  {
    const svg = new TwistyAnimatedSVG(kpuzzle, llSVG);
    const pattern = kpuzzle
      .algToTransformation("r U R' U R U2 r'")
      .toKPattern();
    svg.draw(pattern);
    document.body.appendChild(svg.wrapperElement);
  }
});
