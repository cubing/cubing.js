import { Alg, keyToMove } from "../alg";
import type { KPattern } from "../kpuzzle/KPattern";
import type { PuzzleLoader } from "../puzzles";
import type { KeyMapping } from "../puzzles/cubing-private";
import type { PuzzleID } from "../twisty";
import { BluetoothPuzzle } from "./smart-puzzle/bluetooth-puzzle";

/** @category Keyboard Puzzles */
export class KeyboardPuzzle extends BluetoothPuzzle {
  private keyMappingAndPatternPromise: Promise<
    [KeyMapping | undefined, KPattern]
  >;

  listener: EventListener; // (e: KeyboardEvent) => Promise<void>;

  // TODO: Decide on the right arguments.
  // TODO: support tying the puzzle to a TwistyPlayer.
  constructor(
    private target: Element,
    puzzle: PuzzleID | PuzzleLoader = "3x3x3",
  ) {
    super();
    // TODO: Filter out repeated keydown?
    // TODO: how do we avoid this awkward cast?
    this.listener = this.onKeyDown.bind(this) as any as EventListener;
    target.addEventListener("keydown", this.listener);
    this.keyMappingAndPatternPromise = this.setPuzzleInternal(puzzle);
  }

  public name(): string | undefined {
    return "Keyboard Input";
  }

  async setPuzzleInternal(
    puzzle: PuzzleID | PuzzleLoader,
  ): Promise<[KeyMapping | undefined, KPattern]> {
    const puzzleLoader = await (async () =>
      typeof puzzle === "string"
        ? (await import("../puzzles")).puzzles[puzzle]
        : puzzle)();
    const kpuzzle = await (async () => puzzleLoader.kpuzzle())();
    return Promise.all([puzzleLoader.keyMapping?.(), kpuzzle.defaultPattern()]);
  }

  disconnect() {
    this.target.removeEventListener("keydown", this.listener as EventListener);
  }

  public override async getPattern(): Promise<KPattern> {
    return (await this.keyMappingAndPatternPromise)[1];
  }

  private async onKeyDown(e: KeyboardEvent): Promise<void> {
    if (e.altKey || e.ctrlKey || e.metaKey || e.shiftKey) {
      return;
    }

    this.keyMappingAndPatternPromise = (async () => {
      const [keyMapping, pattern] = await this.keyMappingAndPatternPromise;
      const algLeaf = keyToMove(keyMapping, e);
      let newPattern: KPattern | undefined;
      if (algLeaf) {
        newPattern = pattern.applyAlg(new Alg([algLeaf])); // TODO
        this.dispatchAlgLeaf({
          latestAlgLeaf: algLeaf,
          timeStamp: e.timeStamp,
          pattern: newPattern,
        });
        e.preventDefault();
      }
      return [keyMapping, newPattern ?? pattern];
    })();
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
