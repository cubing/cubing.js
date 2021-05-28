// Stub file for testing.
// Feel free to add code here if you need a quick place to run some code, but avoid committing any changes.

import { Alg } from "../../../cubing/alg";
import { TwistyPlayer } from "../../../cubing/twisty";
import { AlgTracker } from "../../../cubing/twisty/dom/AlgTracker";

// Note: this file needs to contain code to avoid a Snowpack error.
// So we put a `console.log` here for now.
console.log("Loading stub file.");

const alg = `F U2 L2 B2 F' U L2 U R2 D2 L' B L2 B' R2 U2

y x' // inspection
U R2 U' F' L F' U' L' // XX-Cross + EO
U' R U R' // 3rd slot
R' U R U2' R' U R // 4th slot
U R' U' R U' R' U2 R // OLL / ZBLL
U // AUF

// from http://cubesolv.es/solve/5757`;
const player = document.body.appendChild(new TwistyPlayer({ alg }));

const algTracker = new AlgTracker();
algTracker.algString = alg;
document.body.appendChild(algTracker);

algTracker.addEventListener(
  "effectiveAlgChange",
  (e: CustomEvent<{ alg: Alg }>) => {
    try {
      player.alg = e.detail.alg;
      algTracker.setAlgValidForPuzzle(true);
    } catch (e) {
      console.error("cannot set alg for puzzle", e);
      player.alg = new Alg();
      algTracker.setAlgValidForPuzzle(false);
    }
  },
);

algTracker.addEventListener(
  "animatedMoveIndexChange",
  (e: CustomEvent<{ idx: number }>) => {
    try {
      const timestamp = player.cursor!.experimentalTimestampFromIndex(
        e.detail.idx,
      );
      console.log(e.detail.idx, timestamp);
      player.timeline.setTimestamp(timestamp);
    } catch (e) {
      // console.error("cannot set idx", e);
      player.timeline.timestamp = 0;
    }
  },
);

const algTracker2 = new AlgTracker();
document.body.appendChild(algTracker2);
