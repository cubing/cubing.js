// Stub file for testing.
// Feel free to add code here if you need a quick place to run some code, but avoid committing any changes.

import { TwistyPlayer } from "../../../../cubing/twisty";

const player1 = document.body.appendChild(
  new TwistyPlayer({
    alg: "[F: [U, R]]",
  }),
);
const player2 = document.body.appendChild(
  new TwistyPlayer({
    alg: "[F': [U', L']]",
    controlPanel: "none",
  }),
);

player1.experimentalModel.detailedTimelineInfo.addFreshListener(
  (detailedTimelineInfo) => {
    player2.timestamp = detailedTimelineInfo.timestamp;
  },
);
