import { keyToMove } from "../alg";
import { OldKPuzzle } from "../kpuzzle";
import { puzzles } from "../puzzles";
import { BluetoothPuzzle, PuzzleState } from "./smart-puzzle/bluetooth-puzzle";

export class KeyboardPuzzle extends BluetoothPuzzle {
  public puzzle: Promise<OldKPuzzle> = (async () =>
    new OldKPuzzle(await puzzles["3x3x3"].def()))();

  listener: (e: KeyboardEvent) => Promise<void>;

  // TODO: Decide on the right arguments.
  constructor(private target: Element) {
    super();
    // TODO: Filter out repeated keydown?
    this.listener = this.onKeyDown.bind(this);
    target.addEventListener("keydown", this.listener);
  }

  public name(): string | undefined {
    return "Keyboard Input";
  }

  disconnect() {
    this.target.removeEventListener("keydown", this.listener);
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
      (await this.puzzle).applyMove(move);
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
