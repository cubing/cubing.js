// Stub file for testing.
// Feel free to add code here if you need a quick place to run some code, but avoid committing any changes.

import { TwistyPlayer } from "../../../../cubing/twisty";

const player = document.body.appendChild(
  new TwistyPlayer({
    cameraLatitude: 45,
    cameraLongitude: 45,
    backView: "side-by-side",
  }),
);
player.style.setProperty("width", "1024");
player.style.setProperty("height", "768");
setTimeout(() => {
  player.experimentalModel.twistySceneModel.stickeringMask.set(
    "EDGES:DDDD--------DDDDDD----DD,CORNERS:II----------II--,CENTERS:DDDDDDDDDDDD",
  );
}, 100);
