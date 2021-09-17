import type { TwistyPlayer } from "../../twisty";
import {
  PieceStickering,
  PuzzleStickering,
  StickeringManager,
} from "./appearance";

type Stickerer = (
  puzzleStickering: PuzzleStickering,
  m: StickeringManager,
) => void;

let globalCustomStickerer: Stickerer = () => {};

function setGlobalCustomStickerer(stickerer: Stickerer): void {
  (async () => {
    globalCustomStickerer = stickerer;

    const players = Array.from(
      document.body.querySelectorAll("twisty-player"),
    ) as Array<TwistyPlayer>;
    console.log(`Setting the custom stickering for ${players.length} players!`);
    const successPromises = [];
    for (const player of players) {
      successPromises.push(
        (async () => {
          const stickering =
            await player.experimentalModel.stickeringProp.get();
          player.experimentalStickering =
            stickering === "experimental-global-custom-1"
              ? "experimental-global-custom-2"
              : "experimental-global-custom-1";
        })(),
      );
    }
    await Promise.all(successPromises);
    console.log("Success!");
  })();
}

export function useGlobalCustomStickerer(
  puzzleStickering: PuzzleStickering,
  m: StickeringManager,
): void {
  globalCustomStickerer(puzzleStickering, m);
}

if (
  typeof location !== "undefined" &&
  new URL(location.href).searchParams.get("global-custom-stickerer") === "true"
) {
  (window as any).setGlobalCustomStickerer = setGlobalCustomStickerer;
  (window as any).PieceStickering = PieceStickering;
  console.log(
    "Global custom stickerer enabled! (using: global-custom-stickerer=true)",
  );
  console.log(
    "Look here for inspiration:",
    "https://github.com/cubing/cubing.js/blob/81b5cab3e27d8defb39dd1e0a10bc9e8ba894d26/src/cubing/puzzles/stickerings/cube-stickerings.ts#L67",
  );
}
