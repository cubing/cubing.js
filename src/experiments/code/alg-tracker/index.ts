import { Alg, Move, Pause } from "../../../cubing/alg";
import type { Parsed } from "../../../cubing/alg/parse";
import { TwistyPlayer } from "../../../cubing/twisty";
import type { PuzzlePosition } from "../../../cubing/twisty/animation/cursor/CursorTypes";
import { TwistyAlgEditor } from "../../../cubing/twisty";

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

const twistyAlgEditor = new TwistyAlgEditor();
twistyAlgEditor.algString = alg;
document.body.appendChild(twistyAlgEditor);

twistyAlgEditor.addEventListener(
  "effectiveAlgChange",
  (e: CustomEvent<{ alg: Alg }>) => {
    try {
      player.alg = e.detail.alg;
      twistyAlgEditor.setAlgValidForPuzzle(true);
    } catch (e) {
      console.error("cannot set alg for puzzle", e);
      player.alg = new Alg();
      twistyAlgEditor.setAlgValidForPuzzle(false);
    }
  },
);

twistyAlgEditor.addEventListener(
  "animatedMoveIndexChange",
  (
    e: CustomEvent<{
      idx: number;
      isAtStartOfLeaf: Blob;
      leaf: Parsed<Move | Pause>;
    }>,
  ) => {
    try {
      const timestamp = player.cursor!.experimentalTimestampFromIndex(
        e.detail.idx,
      );
      // console.log(e.detail, timestamp, e.detail.leaf);
      player.timeline.setTimestamp(
        timestamp + (e.detail.isAtStartOfLeaf ? 250 : 0),
      );
    } catch (e) {
      // console.error("cannot set idx", e);
      player.timeline.timestamp = 0;
    }
  },
);

setTimeout(() => {
  player.cursor!.addPositionListener({
    onPositionChange: (position: PuzzlePosition): void => {
      if (position.movesInProgress.length > 0) {
        twistyAlgEditor.highlightLeaf(
          position.movesInProgress[0].move as Parsed<Move>,
        );
      }
    },
  });
}, 100);
