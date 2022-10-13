import type { TwistyPlayer } from "../../../../cubing/twisty";
import type { OrbitCoordinatesRequest } from "../../../../cubing/twisty/model/props/viewer/OrbitCoordinatesRequestProp";

export function getScaleParam(param: string, defaultVal: number = 1): number {
  const str = new URL(location.href).searchParams.get(param);
  return str === null ? defaultVal : parseFloat(str);
}

export function demoSpinCamera(
  twistyPlayer: TwistyPlayer,
  tempoScale: number = 1,
): void {
  let lastTimestamp = performance.now();
  const CAM_ROTATION_DEG_PER_SEC = -24 * tempoScale;

  let rotating = true;
  twistyPlayer.addEventListener(
    "click",
    () => {
      rotating = false;
    },
    { once: true },
  );

  function rotate(timestamp: number): void {
    if (!rotating) {
      return;
    }
    requestAnimationFrame(rotate);
    const delta_deg =
      ((timestamp - lastTimestamp) / 1000) * CAM_ROTATION_DEG_PER_SEC;
    lastTimestamp = timestamp;
    twistyPlayer.experimentalModel.twistySceneModel.orbitCoordinatesRequest.set(
      (async (): Promise<OrbitCoordinatesRequest> => {
        const { longitude } =
          await twistyPlayer.experimentalModel.twistySceneModel.orbitCoordinates.get();
        return { longitude: longitude + delta_deg };
      })(),
    );
  }
  requestAnimationFrame(rotate);
}
