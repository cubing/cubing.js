import { Alg, type AlgLeaf, Move } from "../../../../cubing/alg";
import {
  connectSmartPuzzle,
  debugKeyboardConnect,
  type MoveEvent,
  type OrientationEvent,
} from "../../../../cubing/bluetooth";
import { countMetricMoves } from "../../../../cubing/notation/CountMoves";
import { CommonMetric } from "../../../../cubing/notation/commonMetrics";
import { cube3x3x3 } from "../../../../cubing/puzzles";
import { randomScrambleForEvent } from "../../../../cubing/scramble";
import { TwistyPlayer } from "../../../../cubing/twisty";
import { Stats } from "./vendor/timer.cubing.net/Stats";
import { type Milliseconds, Timer } from "./vendor/timer.cubing.net/Timer";

function appendWithFMCCancellation(alg: Alg, leaf: AlgLeaf): Alg {
  const nodes = [...alg.childAlgNodes()];
  const previous = nodes.at(-1)?.as(Move);
  const newMove = leaf.as(Move);
  if (previous && newMove) {
    if (previous.quantum.isIdentical(newMove.quantum)) {
      nodes.splice(-1);
      const amount = ((((previous.amount + newMove.amount) % 4) + 5) % 4) - 1;
      nodes.push(previous.modified({ amount }));
    } else {
      nodes.push(leaf);
    }
  } else {
    nodes.push(leaf);
  }
  return new Alg(nodes);
}

(globalThis as any).puzzle = null;

let countingAlg = new Alg();

const debugUseKeyboard =
  new URL(location.href).searchParams.get("debug-keyboard") === "true";

const COMPETITOR_LOCAL_STORAGE_KEY = "linear-fmc-competitor-name";
class Competitor {
  elem = document.querySelector("#competitor") as HTMLButtonElement;
  name = localStorage[COMPETITOR_LOCAL_STORAGE_KEY];
  constructor() {
    if (this.name) {
      this.elem.value = this.name;
    }
    this.elem.addEventListener("input", () => {
      this.name = this.elem.value;
      localStorage[COMPETITOR_LOCAL_STORAGE_KEY] = this.name;
    });
  }
}
const competitor = new Competitor();

const timeLimit: Milliseconds = 2 * 60 * 1000; // 2 minutes

window.addEventListener("DOMContentLoaded", async () => {
  const kpuzzle = await cube3x3x3.kpuzzle();

  const timeDisplay = document.querySelector(".time-display") as HTMLDivElement;
  const updateTimeCallback = (t: Milliseconds) => {
    const remaining = timeLimit - t; // Emulate a countdown.
    timeDisplay.textContent =
      remaining < 0 ? "DNF" : Stats.formatTime(remaining + +999);
  };
  const timer = new Timer(updateTimeCallback);
  updateTimeCallback(0);

  const twistyPlayer = new TwistyPlayer({
    alg: new Alg(),
  });
  document.querySelector("#player")!.appendChild(twistyPlayer);
  // document
  //   .querySelector("#controls")!
  //   .appendChild(new TwistyAlgViewer({ twistyPlayer }));
  const countingMovesElem = document.querySelector(
    "#counting-moves",
  ) as HTMLElement;

  const scrambleDisplaySection = document.querySelector(
    "#scramble-display",
  ) as HTMLDivElement;
  const scrambleDisplayPlayer = scrambleDisplaySection.querySelector(
    "twisty-player",
  ) as TwistyPlayer;
  const scrambleDisplayAlgViewer =
    scrambleDisplaySection.querySelector("twisty-alg-viewer")!;

  async function displayNewScramble() {
    const useTrivialTestScramble =
      new URL(location.href).searchParams.get("use-trivial-test-scramble") ===
      "true";
    const scramble = useTrivialTestScramble
      ? "R U R'"
      : await randomScrambleForEvent("333");
    scrambleDisplayPlayer.alg = scramble;
    scrambleDisplaySection.hidden = false;
    scrambleDisplayAlgViewer.classList.toggle("correct", false);
    // timeDisplay.hidden = true;
  }
  displayNewScramble();

  // function showTimer() {
  //   // timeDisplay.hidden = false;
  //   scrambleDisplaySection.hidden = true;
  // }

  const connectButton = document.querySelector("#connect") as HTMLButtonElement;
  connectButton.addEventListener("click", async () => {
    // const acceptAllDevices = (document.querySelector(
    //   "#acceptAllDevices",
    // ) as HTMLInputElement).checked;
    const puzzle = debugUseKeyboard
      ? await debugKeyboardConnect()
      : await connectSmartPuzzle();
    (globalThis as any).puzzle = puzzle;
    // TODO
    // try {
    //   const state = await puzzle.getState();
    //   twistyPlayer.experimentalSetStartStateOverride(state);
    //   twistyPlayer.alg = new Alg();
    // } catch (e) {
    //   console.error("Unable to get initial state", e);
    // }
    connectButton.textContent = `Connected: ${puzzle.name() ?? "[unknown"}`;
    connectButton.disabled = true;

    function countingAlgNumMoves(): number {
      return countMetricMoves(
        cube3x3x3,
        CommonMetric.OuterBlockTurnMetric,
        countingAlg,
      );
    }

    async function updateCountingAlg(newAlg: Alg) {
      countingAlg = newAlg;
      countingMovesElem.textContent = countingAlg.toString();
      const numMoves = countingAlgNumMoves();
      document.querySelector("#obtm")!.textContent = numMoves.toString();
      (document.querySelector("#moves-plural") as HTMLElement).hidden =
        numMoves === 1;
    }

    puzzle.addAlgLeafListener(async (e: MoveEvent) => {
      twistyPlayer.experimentalAddAlgLeaf(e.latestAlgLeaf);
      updateCountingAlg(
        appendWithFMCCancellation(countingAlg, e.latestAlgLeaf),
      );
      const correct = kpuzzle
        .defaultPattern()
        .applyAlg(countingAlg)
        .isIdentical(
          await scrambleDisplayPlayer.experimentalModel.currentPattern.get(),
        );
      scrambleDisplayAlgViewer.classList.toggle("correct", correct);
    });

    const moveAlgToScrambleButton = document.querySelector(
      "#move-alg-to-scramble",
    ) as HTMLButtonElement;
    const startTimerButton = document.querySelector(
      "#start-timer",
    ) as HTMLButtonElement;
    const stopTimerButton = document.querySelector(
      "#stop-timer",
    ) as HTMLButtonElement;
    const scrambleSection =
      document.querySelector<HTMLElement>("#scramble-section")!;

    const resetButton = document.querySelector(
      "#player-pattern-reset",
    ) as HTMLButtonElement;
    resetButton.addEventListener("click", () => {
      // twistyPlayer.experimentalSetStartStateOverride(null);
      twistyPlayer.experimentalSetupAlg = new Alg();
      twistyPlayer.alg = new Alg();
      scrambleSection.hidden = true;
      scrambleTextElem.textContent = "";
      moveAlgToScrambleButton.disabled = false;
      updateCountingAlg(new Alg());
      recordResultButton.disabled = true;
      resetButton.disabled = true;
      timer.reset();
      moveAlgToScrambleButton.focus();
      displayNewScramble();
    });
    resetButton.disabled = true;

    const scrambleTextElem = scrambleSection.querySelector(".scramble-text")!;
    moveAlgToScrambleButton.addEventListener("click", async () => {
      scrambleSection.hidden = false;
      scrambleTextElem.textContent = countingAlg.toString();
      twistyPlayer.experimentalSetupAlg = countingAlg;
      twistyPlayer.alg = new Alg();
      updateCountingAlg(new Alg());
      scrambleDisplaySection.hidden = true;
      recordResultButton.disabled = false;
      moveAlgToScrambleButton.disabled = true;
      startTimerButton.disabled = false;
      startTimerButton.focus();
    });
    moveAlgToScrambleButton.disabled = false;

    const recordResultButton = document.querySelector(
      "#record-result",
    ) as HTMLButtonElement;
    recordResultButton.addEventListener("click", async () => {
      const key = `linear-fmc-results:${competitor.name}`;
      const results = JSON.parse(localStorage[key] ?? "[]");
      const result = {
        competitor: competitor.name,
        attemptNumber: results.length + 1,
        numMoves: countingAlgNumMoves(),
        scramble: (
          await twistyPlayer.experimentalModel.setupAlg.get()
        ).alg.toString(),
        solution: countingAlg.toString(),
        timestamp: Date.now(),
      };
      console.log(result);
      results.push(result);
      // navigator.clipboard.writeText(
      //   `${competitor.name}\t${result.numMoves}\t${result.scramble}\t${result.solution}`,
      // );
      localStorage[key] = JSON.stringify(results);
      resetButton.disabled = false;
    });
    recordResultButton.disabled = true;

    startTimerButton.addEventListener("click", () => {
      timer.start();
      startTimerButton.disabled = true;
      stopTimerButton.disabled = false;
      stopTimerButton.focus();

      timeDisplay.animate([{ opacity: 0 }, { opacity: 1 }], {
        duration: 500,
        easing: "ease-out",
      });
    });

    stopTimerButton.addEventListener("click", () => {
      timer.stop();
      recordResultButton.focus();
      stopTimerButton.disabled = true;
      recordResultButton.focus();
    });

    // const cubeStateButton = document.querySelector(
    //   "#player-state-read",
    // ) as HTMLButtonElement;
    // cubeStateButton.addEventListener("click", async () => {
    //   try {
    //     twistyPlayer.experimentalSetStartStateOverride(await puzzle.getState());
    //   } catch (e) {
    //     twistyPlayer.experimentalSetStartStateOverride(null);
    //   }
    //   twistyPlayer.alg = new Alg();
    // });
    // cubeStateButton.disabled = false;

    puzzle.addOrientationListener((_e: OrientationEvent) => {
      // TODO
      // const { x, y, z, w } = e.quaternion;
      // twistyPlayer
      //   .experimentalGetPlayer()
      //   .cube3DView.experimentalGetCube3D()
      //   .experimentalGetCube()
      //   .quaternion.copy(new Quaternion(x, y, z, w));
      // twistyPlayer
      //   .experimentalGetAnim()
      //   .experimentalGetScheduler()
      //   .singleFrame();
    });

    moveAlgToScrambleButton.focus();
  });
});
