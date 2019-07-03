import {keyToMove} from "../alg/index"
import {KPuzzle, Puzzles} from "../kpuzzle/index"
import {BluetoothPuzzle, PuzzleState} from "./bluetooth-puzzle"

const def = Puzzles["333"];

export class KeyboardPuzzle extends BluetoothPuzzle {
  public puzzle: KPuzzle = new KPuzzle(def);
  // TODO: Decide on the right arguments.
  constructor(target: any) {
    super();
    // TODO: Filter out repeated keydown?
    target.addEventListener("keydown", this.onKeyDown.bind(this));
  }

  public name(): string | undefined {
    return "Keyboard Input";
  }

  async getState(): Promise<PuzzleState> {
    return this.puzzle.state;
  }

  private onKeyDown(e: KeyboardEvent) {
    if (e.altKey || e.ctrlKey || e.metaKey || e.shiftKey) {
      return;
    }

    const move = keyToMove(e);
    if (move) {
      this.puzzle.applyBlockMove(move);
      this.dispatchMove({
        latestMove: move,
        timeStamp: e.timeStamp,
        state: this.puzzle.state
      });
      e.preventDefault();
    }
  }
}

// TODO: Type
export async function debugKeyboardConnect(target: any = window): Promise<KeyboardPuzzle> {
  return new KeyboardPuzzle(target);
}
