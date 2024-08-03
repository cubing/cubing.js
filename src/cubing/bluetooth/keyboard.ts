import { Alg, keyToMove } from "../alg";
import type { KPattern } from "../kpuzzle/KPattern";
import type { PuzzleLoader } from "../puzzles";
import type { KeyMapping } from "../puzzles/cubing-private";
import type { PuzzleID } from "../twisty";
import { BluetoothPuzzle } from "./smart-puzzle/bluetooth-puzzle";

/** @category Keyboard Puzzles */
export class KeyboardPuzzle extends BluetoothPuzzle {
  private keyMappingPromise: Promise<KeyMapping | undefined>;
  private pattern: Promise<KPattern>;

  listener: (e: KeyboardEvent) => Promise<void>;

  // TODO: Decide on the right arguments.
  // TODO: support tying the puzzle to a TwistyPlayer.
  constructor(
    private target: Element,
    puzzle: PuzzleID | PuzzleLoader = "3x3x3",
  ) {
    super();
    // TODO: Filter out repeated keydown?
    this.listener = this.onKeyDown.bind(this);
    target.addEventListener("keydown", this.listener);
    this.setPuzzle(puzzle);
  }

  public name(): string | undefined {
    return "Keyboard Input";
  }

  public async setPuzzle(puzzle: PuzzleID | PuzzleLoader) {
    const puzzlePromise = (async () =>
      typeof puzzle === "string"
        ? (await import("../puzzles")).puzzles[puzzle]
        : puzzle)();
    const kpuzzlePromise = (async () => (await puzzlePromise).kpuzzle())();
    this.keyMappingPromise = (async () =>
      (await puzzlePromise).keyMapping?.())();
    this.pattern = (async () => (await kpuzzlePromise).defaultPattern())();
  }

  disconnect() {
    this.target.removeEventListener("keydown", this.listener);
  }

  public override async getPattern(): Promise<KPattern> {
    return this.pattern;
  }

  private async onKeyDown(e: KeyboardEvent): Promise<void> {
    if (e.altKey || e.ctrlKey || e.metaKey || e.shiftKey) {
      return;
    }

    const algLeaf = keyToMove(await this.keyMappingPromise, e);
    if (algLeaf) {
      const newPattern = (await this.pattern).applyAlg(new Alg([algLeaf])); // TODO
      this.pattern = Promise.resolve(newPattern);
      this.dispatchAlgLeaf({
        latestAlgLeaf: algLeaf,
        timeStamp: e.timeStamp,
        pattern: newPattern,
      });
      e.preventDefault();
    }
  }
}

// TODO: Type
/** @category Keyboard Puzzles */
export async function debugKeyboardConnect(
  target: any = window,
  puzzle: PuzzleID | PuzzleLoader = "3x3x3",
): Promise<KeyboardPuzzle> {
  return new KeyboardPuzzle(target, puzzle);
}
