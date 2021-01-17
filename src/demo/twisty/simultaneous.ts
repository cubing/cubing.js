import { parseAlg } from "../../cubing/alg";
import { Cube3D, TwistyPlayer } from "../../cubing/twisty";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import supercubeSprite from "url:./supercube-sprite.png";

{
  const player = new TwistyPlayer({
    alg: parseAlg(
      "y' y' U' E D R2 r2 F2 B2 U E D' R2 L2' z2 S2 U U D D S2 F2' B2",
    ),
  });
  player.experimentalSetCursorIndexer("simultaneous");
  document.querySelector(".demo1")!.appendChild(player);
  player.style.height = "400px";
}

{
  const player = new TwistyPlayer({
    alg: parseAlg("M' R' U' D' M R"),
    setupAlg: parseAlg("(M' R' U' D' M R)'"),
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
    alg: parseAlg("(L R) U2 (L' R') U (L R) U2 (L' R') U"),
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
    alg: parseAlg("U' E' r E r2' E r U E"),
  });
  player.experimentalSetCursorIndexer("simultaneous");
  document.querySelector(".demo4")!.appendChild(player);
  player.timeline.tempoScale = 4;
}

{
  const player = new TwistyPlayer({
    alg: parseAlg("(L R) U2 (L' R') U (L R) U2 (L' R') U"),
    puzzle: "5x5x5",
  });
  player.experimentalSetCursorIndexer("simultaneous");
  document.querySelector(".demo5")!.appendChild(player);
}
