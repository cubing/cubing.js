import { Vector3 } from "three/src/math/Vector3.js";
import { getPuzzleDescriptionString } from "../../../cubing/puzzle-geometry";
import type { PuzzleDescriptionString } from "../../../cubing/puzzle-geometry/PGPuzzles";
import { getPuzzleGeometryByDesc } from "../../../cubing/puzzle-geometry/PuzzleGeometry";
import {
  setTwistyDebug,
  TwistyPlayer,
  type TwistyPlayerConfig,
} from "../../../cubing/twisty";
import type { OrbitCoordinates } from "../../../cubing/twisty/model/props/viewer/OrbitCoordinatesRequestProp";
import { positionToOrbitCoordinates } from "../../../cubing/twisty/views/3D/TwistyOrbitControls";
import { getConfigFromURL } from "../../../cubing/twisty/views/twizzle/url-params";
import { setupPropInputs } from "./prop-inputs";
import { getURLParam, setAlgParam } from "./url-params";

export function constructTwistyPlayer(): TwistyPlayer {
  if (getURLParam("debug-show-render-stats")) {
    setTwistyDebug({ showRenderStats: true });
  }

  const config = getConfigFromURL();
  console.log(config);
  config.experimentalPuzzleDescription ??= getPuzzleDescriptionString(
    config.puzzle ?? "3x3x3",
  );
  delete config["puzzle"];
  const explorerConfig: TwistyPlayerConfig = {
    cameraLatitudeLimit: 90,
    viewerLink: "none",
    experimentalMovePressInput: "basic",
    experimentalMovePressCancelOptions: {
      directional: "any-direction",
      puzzleSpecificModWrap: "gravity",
    },
    hintFacelets: "none",
  };
  Object.assign(config, explorerConfig);
  const twistyPlayer = new TwistyPlayer(config);

  const initialCameraOrbitCoordinatesPromise = cameraCoords(
    config.experimentalPuzzleDescription ?? "c", // TODO
  );
  // TODO
  twistyPlayer.experimentalModel.twistySceneModel.orbitCoordinatesRequest.set(
    initialCameraOrbitCoordinatesPromise,
  );

  setupPropInputs(twistyPlayer);
  twistyPlayer.experimentalModel.alg.addFreshListener((algWithIssues) => {
    setAlgParam("alg", algWithIssues.alg.toString());
  });
  return twistyPlayer;
}

const platonicShapeToGeoTowardsViewer: Record<string, string> = {
  t: "FLR",
  c: "URF",
  o: "FLUR",
  d: "F",
  i: "F",
};
async function cameraCoords(
  desc: PuzzleDescriptionString,
): Promise<OrbitCoordinates> {
  const pg = getPuzzleGeometryByDesc(desc); // TODO: Avoid this
  const platonicShape = desc[0];
  const geoTowardsViewer = platonicShapeToGeoTowardsViewer[platonicShape];

  if (!geoTowardsViewer) {
    throw new Error("invalid shape for coords");
  }
  const norm = pg.getGeoNormal(geoTowardsViewer);
  if (!norm) {
    throw new Error("invalid normal");
  }
  return positionToOrbitCoordinates(new Vector3(...norm).multiplyScalar(6));
}
