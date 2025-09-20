import type { MillisecondTimestamp } from "cubing/twisty/controllers/AnimationTypes";
import { Alg, Move } from "../../../../cubing/alg";
import { TwistyAlgViewer, TwistyPlayer } from "../../../../cubing/twisty";

const supercubeSprite = new URL(
  "./supercube-sprite.png",
  import.meta.url,
).toString();

function t(n: number): MillisecondTimestamp {
  return n as MillisecondTimestamp;
}

{
  const player = new TwistyPlayer({
    alg: Alg.fromString(
      "y' y' U' E D R2 r2 F2 B2 U E D' R2 L2' z2 S2 U U D D S2 F2' B2",
    ),
  });
  player.experimentalModel.animationTimelineLeavesRequest.set([
    { animLeaf: new Move("y", -1), start: t(0), end: t(1000) },
    { animLeaf: new Move("y", -1), start: t(1000), end: t(2000) },
    { animLeaf: new Move("U", -1), start: t(1000), end: t(1600) },
    { animLeaf: new Move("E", 1), start: t(1200), end: t(1800) },
    { animLeaf: new Move("D"), start: t(1400), end: t(2000) },
    { animLeaf: new Move("R", 2), start: t(2000), end: t(3500) },
    { animLeaf: new Move("r", 2), start: t(2000), end: t(3500) },
    { animLeaf: new Move("F", 2), start: t(3500), end: t(4200) },
    { animLeaf: new Move("B", 2), start: t(3800), end: t(4500) },
    { animLeaf: new Move("U", 1), start: t(4500), end: t(5500) },
    { animLeaf: new Move("E", 1), start: t(4500), end: t(5500) },
    { animLeaf: new Move("D", -1), start: t(4500), end: t(5500) },
    { animLeaf: new Move("R", 2), start: t(5500), end: t(6500) },
    { animLeaf: new Move("L", -2), start: t(5500), end: t(6500) },
    { animLeaf: new Move("z", 2), start: t(5500), end: t(6500) },
    { animLeaf: new Move("S", 2), start: t(6500), end: t(7500) },
    { animLeaf: new Move("U"), start: t(7500), end: t(8000) },
    { animLeaf: new Move("D"), start: t(7750), end: t(8250) },
    { animLeaf: new Move("U"), start: t(8000), end: t(8500) },
    { animLeaf: new Move("D"), start: t(8250), end: t(8750) },
    { animLeaf: new Move("S", 2), start: t(8750), end: t(9250) },
    { animLeaf: new Move("F", -2), start: t(8750), end: t(10000) },
    { animLeaf: new Move("B", 2), start: t(8750), end: t(10000) },
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
    { animLeaf: new Move("M", -1), start: t(0), end: t(1000) },
    { animLeaf: new Move("R", -1), start: t(0), end: t(1000) },
    { animLeaf: new Move("U", -1), start: t(1000), end: t(2000) },
    { animLeaf: new Move("D", -1), start: t(1000), end: t(2000) },
    { animLeaf: new Move("M"), start: t(2000), end: t(3000) },
    { animLeaf: new Move("R"), start: t(2000), end: t(3000) },
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
    { animLeaf: algNodes[0], start: t(0), end: t(1000) },
    { animLeaf: algNodes[1], start: t(0), end: t(1000) },
    { animLeaf: algNodes[2], start: t(1000), end: t(2500) },
    { animLeaf: algNodes[3], start: t(2500), end: t(3500) },
    { animLeaf: algNodes[4], start: t(3500), end: t(5000) },
    { animLeaf: algNodes[5], start: t(5000), end: t(6000) },
    { animLeaf: algNodes[6], start: t(6000), end: t(7000) },
    { animLeaf: algNodes[7], start: t(7000), end: t(8000) },
    { animLeaf: algNodes[8], start: t(7000), end: t(8000) },
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
    { animLeaf: algNodes[0], start: t(0), end: t(120) },
    { animLeaf: algNodes[1], start: t(150), end: t(235) },
    { animLeaf: algNodes[2], start: t(240), end: t(270) },
    { animLeaf: algNodes[3], start: t(270), end: t(310) },
    { animLeaf: algNodes[4], start: t(335), end: t(380) },
    { animLeaf: algNodes[5], start: t(380), end: t(470) },
    { animLeaf: algNodes[6], start: t(470), end: t(535) },
  ]);
  document.querySelector(".demo6")!.appendChild(player);
  document
    .querySelector(".demo6")!
    .appendChild(new TwistyAlgViewer({ twistyPlayer: player }));
}
