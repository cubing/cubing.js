import { getPuzzleGeometryByName } from "../../src/puzzle-geometry";
import { parse as kpuzzleParse } from "../../src/kpuzzle/";
import { TwistyPlayerOld } from "../../src/twisty";
import { parse } from "../../src/alg/";
import { Vector3 } from "three";

const pg = getPuzzleGeometryByName("4x4x4", [
  "orientcenters",
  "true",
  "puzzleorientation",
  '["U", [0, 1, 0], "F", [0, 0, 1]]',
]);
const stickerDat = pg.get3d(0.0131);

const kpuzzle = kpuzzleParse(pg.writeksolve("TwizzlePuzzle", true));

const cameraPosition = new Vector3(2, 4, 4);

const cube3DPlayer = new TwistyPlayerOld();
document.body.appendChild(cube3DPlayer);

const pg3dPlayer = new TwistyPlayerOld({
  alg: parse("U F R"),
  puzzle: kpuzzle,
  playerConfig: {
    visualizationFormat: "PG3D",
    experimentalPG3DViewConfig: {
      stickerDat,
      showFoundation: true,
      experimentalInitialVantagePosition: cameraPosition,
    },
  },
});
document.body.appendChild(pg3dPlayer);
