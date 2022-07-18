import { keyToMove } from "../alg";
import type { KPuzzle } from "../kpuzzle";
import type { KState } from "../kpuzzle/KState";
import { puzzles } from "../puzzles";
import { BluetoothPuzzle } from "./smart-puzzle/bluetooth-puzzle";

/** @category Keyboard Puzzles */
export class KeyboardPuzzle extends BluetoothPuzzle {
  private puzzle: Promise<KPuzzle> = puzzles["3x3x3"].kpuzzle();
  private state: Promise<KState> = (async () =>
    (await this.puzzle).startState())();

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

  public async getState(): Promise<KState> {
    return this.state;
  }

  private async onKeyDown(e: KeyboardEvent): Promise<void> {
    if (e.altKey || e.ctrlKey || e.metaKey || e.shiftKey) {
      return;
    }

    const move = keyToMove(e);
    if (move) {
      const newState = (await this.state).applyMove(move);
      this.state = Promise.resolve(newState);
      this.dispatchMove({
        latestMove: move,
        timeStamp: e.timeStamp,
        state: newState,
      });
      e.preventDefault();
    }
  }
}

// TODO: Type
/** @category Keyboard Puzzles */
export async function debugKeyboardConnect(
  target: any = window,
): Promise<KeyboardPuzzle> {
  return new KeyboardPuzzle(target);
}
