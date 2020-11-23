import { keyToMove } from "../alg";
import { KPuzzle } from "../kpuzzle";
import { puzzles } from "../puzzles";
import { BluetoothPuzzle, PuzzleState } from "./bluetooth-puzzle";

export class KeyboardPuzzle extends BluetoothPuzzle {
  public puzzle: Promise<KPuzzle> = (async () =>
    new KPuzzle(await puzzles["3x3x3"].def()))();

  // TODO: Decide on the right arguments.
  constructor(target: Element) {
    super();
    // TODO: Filter out repeated keydown?
    target.addEventListener("keydown", this.onKeyDown.bind(this));
  }

  public name(): string | undefined {
    return "Keyboard Input";
  }

  public async getState(): Promise<PuzzleState> {
    return (await this.puzzle).state;
  }

  private async onKeyDown(e: KeyboardEvent): Promise<void> {
    if (e.altKey || e.ctrlKey || e.metaKey || e.shiftKey) {
      return;
    }

    const move = keyToMove(e);
    if (move) {
      (await this.puzzle).applyBlockMove(move);
      this.dispatchMove({
        latestMove: move,
        timeStamp: e.timeStamp,
        state: (await this.puzzle).state,
      });
      e.preventDefault();
    }
  }
}

// TODO: Type
export async function debugKeyboardConnect(
  target: any = window,
): Promise<KeyboardPuzzle> {
  return new KeyboardPuzzle(target);
}
