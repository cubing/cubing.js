import { Alg } from "../../../../cubing/alg";
import { TwistyPlayer } from "../../../../cubing/twisty";

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
  document.querySelector(".demo1")!.appendChild(player);
  player.style.height = "400px";
}

{
  const player = new TwistyPlayer({
    alg: Alg.fromString("M' R' U' D' M R"),
    experimentalSetupAnchor: "end",
  });
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
  const player = new TwistyPlayer({
    alg: Alg.fromString("U' E' r E r2' E r U E"),
  });
  document.querySelector(".demo4")!.appendChild(player);
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
