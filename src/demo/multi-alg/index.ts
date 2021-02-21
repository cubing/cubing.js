import { Comment, parseAlg, Sequence } from "../../cubing/alg";
import { Twisty3DCanvas, TwistyPlayer } from "../../cubing/twisty";

const player = new TwistyPlayer({});
document.body.appendChild(player);

player.experimentalStickering = "PLL";

function downloadURL(url: string, name: string): void {
  const a = document.createElement("a");
  a.href = url;
  a.download = `${name}.png`;
  a.click();
}

function downloadAlg(s: Sequence, name: string) {
  player.alg = s;
  player.experimentalSetupAnchor = "end";

  const canvas = player.viewerElems[0] as Twisty3DCanvas;
  const dataURL = canvas.renderToDataURL();
  downloadURL(dataURL, name);
}

document.querySelector("#download")?.addEventListener("click", () => {
  const algsTextarea = document.querySelector("#algs")!;

  const allAlgs = parseAlg(algsTextarea.textContent!);

  let currentAlg = new Sequence([]);

  const algList: {
    alg: Sequence;
    name: string;
  }[] = [];

  for (const unit of allAlgs.nestedUnits) {
    if (unit.type === "blockMove") {
      currentAlg = new Sequence(currentAlg.nestedUnits.concat([unit]));
      console.log(currentAlg);
    } else if (unit.type === "comment") {
      algList.push({
        alg: currentAlg,
        name: (unit as Comment).comment.trim(),
      });
      currentAlg = new Sequence([]);
    }
  }

  for (const { alg, name } of algList) {
    downloadAlg(alg, name);
  }

  // drawAlg(parseAlg("R2 U R U R' U' R' U' R' U R'"));
  // drawAlg(parseAlg("R U R' U' R' F R2 U' R' U' R U R' F'"));
});
