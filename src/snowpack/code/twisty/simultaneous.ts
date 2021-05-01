import { Cube3D, TwistyPlayer } from "../../../cubing/twisty";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import supercubeSprite from "url:./supercube-sprite.png";
import { Alg } from "../../../cubing/alg";

{
  const player = new TwistyPlayer({
    alg: Alg.fromString(
      "y' y' U' E D R2 r2 F2 B2 U E D' R2 L2' z2 S2 U U D D S2 F2' B2",
    ),
  });
  player.experimentalSetCursorIndexer("simultaneous");
  document.querySelector(".demo1")!.appendChild(player);
  player.style.height = "400px";
}

{
  const player = new TwistyPlayer({
    alg: Alg.fromString("M' R' U' D' M R"),
    experimentalSetupAlg: Alg.fromString("(M' R' U' D' M R)'"),
  });
  player.experimentalSetCursorIndexer("simultaneous");
  document.querySelector(".demo2")!.appendChild(player);
  player.timeline.tempoScale = 2;
  setTimeout(() => {
    player.timeline.jumpToStart();
  }, 0);
}

{
  const player = new TwistyPlayer({
    alg: Alg.fromString("(L R) U2 (L' R') U (L R) U2 (L' R') U"),
    experimentalStickering: "picture",
  });
  player.experimentalSetCursorIndexer("simultaneous");
  document.querySelector(".demo3")!.appendChild(player);
  setTimeout(() => {
    (player.twisty3D as Cube3D).experimentalSetStickerSpriteURL(
      supercubeSprite,
    );
    setTimeout(() => {
      player.timeline.jumpToStart();
    }, 1000);
  }, 0);
}

{
  const player = new TwistyPlayer({
    alg: Alg.fromString("U' E' r E r2' E r U E"),
  });
  player.experimentalSetCursorIndexer("simultaneous");
  document.querySelector(".demo4")!.appendChild(player);
  player.timeline.tempoScale = 4;
}

{
  const player = new TwistyPlayer({
    alg: Alg.fromString("(L R) U2 (L' R') U (L R) U2 (L' R') U"),
    puzzle: "5x5x5",
  });
  player.experimentalSetCursorIndexer("simultaneous");
  document.querySelector(".demo5")!.appendChild(player);
}
