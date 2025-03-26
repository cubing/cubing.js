import { Alg, Move } from "../../../../cubing/alg";
import { TwistyAlgViewer, TwistyPlayer } from "../../../../cubing/twisty";

const supercubeSprite = new URL(
  "./supercube-sprite.png",
  import.meta.url,
).toString();

{
  const player = new TwistyPlayer({
    alg: Alg.fromString(
      "y' y' U' E D R2 r2 F2 B2 U E D' R2 L2' z2 S2 U U D D S2 F2' B2",
    ),
  });
  player.experimentalModel.animationTimelineLeavesRequest.set([
    { animLeaf: new Move("y", -1), start: 0, end: 1000 },
    { animLeaf: new Move("y", -1), start: 1000, end: 2000 },
    { animLeaf: new Move("U", -1), start: 1000, end: 1600 },
    { animLeaf: new Move("E", 1), start: 1200, end: 1800 },
    { animLeaf: new Move("D"), start: 1400, end: 2000 },
    { animLeaf: new Move("R", 2), start: 2000, end: 3500 },
    { animLeaf: new Move("r", 2), start: 2000, end: 3500 },
    { animLeaf: new Move("F", 2), start: 3500, end: 4200 },
    { animLeaf: new Move("B", 2), start: 3800, end: 4500 },
    { animLeaf: new Move("U", 1), start: 4500, end: 5500 },
    { animLeaf: new Move("E", 1), start: 4500, end: 5500 },
    { animLeaf: new Move("D", -1), start: 4500, end: 5500 },
    { animLeaf: new Move("R", 2), start: 5500, end: 6500 },
    { animLeaf: new Move("L", -2), start: 5500, end: 6500 },
    { animLeaf: new Move("z", 2), start: 5500, end: 6500 },
    { animLeaf: new Move("S", 2), start: 6500, end: 7500 },
    { animLeaf: new Move("U"), start: 7500, end: 8000 },
    { animLeaf: new Move("D"), start: 7750, end: 8250 },
    { animLeaf: new Move("U"), start: 8000, end: 8500 },
    { animLeaf: new Move("D"), start: 8250, end: 8750 },
    { animLeaf: new Move("S", 2), start: 8750, end: 9250 },
    { animLeaf: new Move("F", -2), start: 8750, end: 10000 },
    { animLeaf: new Move("B", 2), start: 8750, end: 10000 },
  ]);
  document.querySelector(".demo1")!.appendChild(player);
  player.style.height = "400px";
}

{
  const player = new TwistyPlayer({
    alg: Alg.fromString("M' R' U' D' M R"),
    experimentalSetupAnchor: "end",
  });
  player.experimentalModel.animationTimelineLeavesRequest.set([
    { animLeaf: new Move("M", -1), start: 0, end: 1000 },
    { animLeaf: new Move("R", -1), start: 0, end: 1000 },
    { animLeaf: new Move("U", -1), start: 1000, end: 2000 },
    { animLeaf: new Move("D", -1), start: 1000, end: 2000 },
    { animLeaf: new Move("M"), start: 2000, end: 3000 },
    { animLeaf: new Move("R"), start: 2000, end: 3000 },
  ]);
  // player.experimentalSetCursorIndexer("simultaneous");
  document.querySelector(".demo2")!.appendChild(player);
  player.tempoScale = 2;
}

{
  const player = new TwistyPlayer({
    alg: Alg.fromString("(L R) U2 (L' R') U (L R) U2 (L' R') U"),
    experimentalStickering: "picture",
    experimentalSprite: supercubeSprite,
  });
  document.querySelector(".demo3")!.appendChild(player);
}

{
  const alg = Alg.fromString("U' E' r E r2' E r U E");
  const player = new TwistyPlayer({
    alg,
  });
  const algNodes = Array.from(alg.childAlgNodes());
  player.experimentalModel.animationTimelineLeavesRequest.set([
    { animLeaf: algNodes[0], start: 0, end: 1000 },
    { animLeaf: algNodes[1], start: 0, end: 1000 },
    { animLeaf: algNodes[2], start: 1000, end: 2500 },
    { animLeaf: algNodes[3], start: 2500, end: 3500 },
    { animLeaf: algNodes[4], start: 3500, end: 5000 },
    { animLeaf: algNodes[5], start: 5000, end: 6000 },
    { animLeaf: algNodes[6], start: 6000, end: 7000 },
    { animLeaf: algNodes[7], start: 7000, end: 8000 },
    { animLeaf: algNodes[8], start: 7000, end: 8000 },
  ]);
  document.querySelector(".demo4")!.appendChild(player);
  document
    .querySelector(".demo4")!
    .appendChild(new TwistyAlgViewer({ twistyPlayer: player }));
  player.tempoScale = 4;
}

{
  const player = new TwistyPlayer({
    alg: Alg.fromString("(L R) U2 (L' R') U (L R) U2 (L' R') U"),
    puzzle: "5x5x5",
  });
  player.experimentalModel.indexerConstructorRequest.set("simultaneous");
  document.querySelector(".demo5")!.appendChild(player);
}

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
  document.querySelector(".demo6")!.appendChild(player);
  document
    .querySelector(".demo6")!
    .appendChild(new TwistyAlgViewer({ twistyPlayer: player }));
}
