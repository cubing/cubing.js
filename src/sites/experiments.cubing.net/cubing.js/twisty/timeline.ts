import { Alg } from "../../../../cubing/alg";
import { TwistyAlgViewer, TwistyPlayer } from "../../../../cubing/twisty";

{
  const alg = Alg.fromString("R U R' U R U2' R'");
  const player = new TwistyPlayer({
    alg,
  });
  const algNodes = Array.from(alg.childAlgNodes());
  player.experimentalModel.animationTimelineLeavesRequest.set([
    { animLeaf: algNodes[0], start: 0, end: 120 },
    { animLeaf: algNodes[1], start: 150, end: 235 },
    { animLeaf: algNodes[2], start: 240, end: 270 },
    { animLeaf: algNodes[3], start: 270, end: 310 },
    { animLeaf: algNodes[4], start: 335, end: 380 },
    { animLeaf: algNodes[5], start: 380, end: 470 },
    { animLeaf: algNodes[6], start: 470, end: 535 },
  ]);
  document.querySelector(".demo1")!.appendChild(player);
  document
    .querySelector(".demo1")!
    .appendChild(new TwistyAlgViewer({ twistyPlayer: player }));
}
