import { Vector3 } from "three";
import { getpuzzle } from "../../../cubing/puzzle-geometry";
import type { PuzzleDescriptionString } from "../../../cubing/puzzle-geometry/PGPuzzles";
import { getPuzzleGeometryByDesc } from "../../../cubing/puzzle-geometry/PuzzleGeometry";
import { TwistyPlayer, TwistyPlayerConfig } from "../../../cubing/twisty";
import type { OrbitCoordinates } from "../../../cubing/twisty/model/props/viewer/OrbitCoordinatesRequestProp";
import { positionToOrbitCoordinates } from "../../../cubing/twisty/views/3D/TwistyOrbitControls";
import { getConfigFromURL } from "../core/url-params";
import { setupCheckboxes } from "./inputs";

export function constructTwistyPlayer(): TwistyPlayer {
  const config = getConfigFromURL();
  console.log(config);
  if ("puzzle" in config) {
    config.experimentalPuzzleDescription = getpuzzle(config.puzzle!);
    delete config["puzzle"];
  }
  const initialCameraOrbitCoordinates = cameraCoords(
    config.experimentalPuzzleDescription ?? "c", // TODO
  );
  const explorerConfig: TwistyPlayerConfig = {
    cameraLatitude: initialCameraOrbitCoordinates.latitude,
    cameraLongitude: initialCameraOrbitCoordinates.longitude,
    cameraLatitudeLimit: 90,
    viewerLink: "none",
    experimentalMovePressInput: "basic",
    hintFacelets: "none",
  };
  Object.assign(config, explorerConfig);
  const twistyPlayer = new TwistyPlayer(config);
  setupCheckboxes(twistyPlayer);
  return twistyPlayer;
}

const DEFAULT_CAMERA_DISTANCE = 5; // TODO
const platonicShapeToGeoTowardsViewer: Record<string, string> = {
  t: "FLR",
  c: "URF",
  o: "FLUR",
  d: "F",
  i: "F",
};

//  This function is *not* idempotent when we save the
//  camera position.
function cameraCoords(desc: PuzzleDescriptionString): OrbitCoordinates {
  const pg = getPuzzleGeometryByDesc(desc); // TODO: Avoid this
  const platonicShape = desc[0];
  const geoTowardsViewer = platonicShapeToGeoTowardsViewer[platonicShape];

  if (!geoTowardsViewer) {
    throw new Error("invalid shape for coords");
  }
  const norm = pg.getGeoNormal(geoTowardsViewer);
  if (!norm) {
    return positionToOrbitCoordinates(
      new Vector3(0, 0, DEFAULT_CAMERA_DISTANCE), // TODO: async import?
    );
  }
  return positionToOrbitCoordinates(
    new Vector3(...norm).multiplyScalar(DEFAULT_CAMERA_DISTANCE),
  );
}
