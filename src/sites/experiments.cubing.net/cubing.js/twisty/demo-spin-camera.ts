import type { TwistyPlayer } from "../../../../cubing/twisty";

export function demoSpinCamera(twistyPlayer: TwistyPlayer): void {
  let lastTimestamp = performance.now();
  const CAM_ROTATION_DEG_PER_SEC = -24;

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
    twistyPlayer.experimentalModel.twistyViewerModel.orbitCoordinatesRequest.set(
      (async () => {
        const { longitude } =
          await twistyPlayer.experimentalModel.twistyViewerModel.orbitCoordinates.get();
        return { longitude: longitude + delta_deg };
      })(),
    );
  }
  requestAnimationFrame(rotate);
}
