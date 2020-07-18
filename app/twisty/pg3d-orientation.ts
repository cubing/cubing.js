import { getPuzzleGeometryByName } from "../../src/puzzle-geometry";
import { parse as kpuzzleParse } from "../../src/kpuzzle/";
import { TwistyPlayer } from "../../src/twisty";
import { parse } from "../../src/alg/";
import { Vector3 } from "three";

const pg = getPuzzleGeometryByName("4x4x4", ["orientcenters", "true"]);
const stickerDat = pg.get3d(0.0131);

const kpuzzle = kpuzzleParse(pg.writeksolve("TwizzlePuzzle", true));

const cameraPosition = new Vector3(1.25, 2.5, 2.5);
const cameraLookAt = new Vector3(0, 0, 0);

const cube3DPlayer = new TwistyPlayer();
document.body.appendChild(cube3DPlayer);

const pg3dPlayer = new TwistyPlayer({
  alg: parse("[[U', R], [U, R']]"),
  puzzle: kpuzzle,
  playerConfig: {
    visualizationFormat: "PG3D",
    experimentalPG3DViewConfig: {
      stickerDat,
      showFoundation: true,
    },
  },
});
document.body.appendChild(pg3dPlayer);

setTimeout(() => {
  cube3DPlayer
    .experimentalGetPlayer()
    .cube3DView.experimentalGetCube3D()
    .experimentalGetVantages()[0]
    .camera.position.copy(cameraPosition);
  cube3DPlayer
    .experimentalGetPlayer()
    .cube3DView.experimentalGetCube3D()
    .experimentalGetVantages()[0]
    .camera.lookAt(cameraLookAt);

  pg3dPlayer
    .experimentalGetPlayer()
    .pg3DView.experimentalGetPG3D()
    .experimentalGetVantages()[0]
    .camera.position.copy(cameraPosition);
  pg3dPlayer
    .experimentalGetPlayer()
    .pg3DView.experimentalGetPG3D()
    .experimentalGetVantages()[0]
    .camera.position.copy(cameraLookAt);
}, 100);
