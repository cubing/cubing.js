import type { AlgWithIssues } from "../../../../cubing/twisty/model/props/puzzle/state/AlgProp";
import { TwistyAlgViewer, type TwistyPlayer } from "../../../../cubing/twisty";
import { Alg, LineComment, Newline } from "../../../../cubing/alg";
import { cube3x3x3 } from "../../../../cubing/puzzles";
import { multiCheck } from "./multiCheck";
import {
  debugKeyboardConnect,
  type MoveEvent,
} from "../../../../cubing/bluetooth";
import { randomScrambleForEvent } from "../../../../cubing/scramble";
import { constructMoveCountDisplay } from "../../../../cubing/twisty/cubing-private";

const solved = (await cube3x3x3.kpuzzle()).defaultPattern();

const player = document.querySelector<TwistyPlayer>("twisty-player")!;
const scrambleElem = document.querySelector<TwistyAlgViewer>("#scramble")!;
const moveCountDisplay =
  document.querySelector<HTMLElement>("move-count-display")!;

constructMoveCountDisplay(player.experimentalModel, moveCountDisplay);

const inputPuzzle = await debugKeyboardConnect();
inputPuzzle.addAlgLeafListener((e: MoveEvent) => {
  player.experimentalAddAlgLeaf(e.latestAlgLeaf, {
    cancel: {
      directional: "same-direction",
      puzzleSpecificModWrap: "gravity",
    },
    puzzleSpecificSimplifyOptions: cube3x3x3.puzzleSpecificSimplifyOptions,
  });
});

window.addEventListener("keydown", (e: KeyboardEvent) => {
  if (e.code === "Backspace") {
    player.experimentalRemoveFinalChild();
    e.preventDefault();
  }
});

const scramble = await randomScrambleForEvent("333");
(scrambleElem as any).setAlg(scramble); // TODO: haxx
player.experimentalSetupAlg = scramble;

const signaturesSeen = new Set<string>();
player?.experimentalModel.puzzleAlg.addFreshListener(
  (algWithIssues: AlgWithIssues) => {
    player.experimentalModel.alg.set(
      (async () => {
        const setupAlg =
          await player.experimentalModel.setupAlgTransformation.get(); // TODO: dedup?
        const pattern = solved
          .applyTransformation(setupAlg)
          .applyAlg(algWithIssues.alg);

        const signature = multiCheck(pattern);
        if (!signaturesSeen.has(signature) && signature !== "") {
          signaturesSeen.add(signature);
          return new Alg([
            ...algWithIssues.alg.childAlgNodes(),
            new LineComment(` ${signature}`),
            new Newline(), // TODO: this should not be necessary
          ]);
        }
        return algWithIssues.alg;
      })(),
    );
  },
);
