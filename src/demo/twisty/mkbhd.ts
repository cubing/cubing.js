import { parseAlg } from "../../cubing/alg";
import { debugKeyboardConnect, MoveEvent } from "../../cubing/bluetooth";
import {
  TimelineActionEvent,
  TimestampLocationType,
  TwistyPlayer,
} from "../../cubing/twisty";

const twistyPlayer = document.querySelector("twisty-player")! as TwistyPlayer;
twistyPlayer.timeline.play(); // TODO: add autoplay
twistyPlayer.controls = "none";
twistyPlayer.timeline.addActionListener({
  onTimelineAction: (actionEvent: TimelineActionEvent) => {
    if (actionEvent.locationType === TimestampLocationType.EndOfTimeline)
      twistyPlayer.timeline.jumpToStart();
    twistyPlayer.timeline.play();
  },
});

const haveHadKeyboardInput = false;
(async () => {
  const kb = await debugKeyboardConnect();
  kb.addMoveListener((e: MoveEvent) => {
    if (!haveHadKeyboardInput) {
      twistyPlayer.alg = parseAlg("");
    }
    twistyPlayer.experimentalAddMove(e.latestMove);
  });
})();

let lastTimestamp = performance.now();
const ROTATION_RATE = (2 * Math.PI) / 15;
function rotate() {
  const newTimestamp = performance.now();
  twistyPlayer.twisty3D?.rotateY(
    ((newTimestamp - lastTimestamp) / 1000) * ROTATION_RATE,
  );
  if (
    !(twistyPlayer.viewerElems[0] as any)?.orbitControls
      .experimentalHasBeenMoved
  ) {
    requestAnimationFrame(rotate);
    lastTimestamp = newTimestamp;
  }
}
requestAnimationFrame(rotate);
