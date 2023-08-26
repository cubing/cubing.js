import { Alg, keyToMove } from "../alg";
import type { KPuzzle } from "../kpuzzle";
import type { KPattern } from "../kpuzzle/KPattern";
import { puzzles } from "../puzzles";
import { BluetoothPuzzle } from "./smart-puzzle/bluetooth-puzzle";

/** @category Keyboard Puzzles */
export class KeyboardPuzzle extends BluetoothPuzzle {
  private puzzle: Promise<KPuzzle> = puzzles["3x3x3"].kpuzzle();
  private pattern: Promise<KPattern> = (async () =>
    (await this.puzzle).defaultPattern())();

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

  public override async getPattern(): Promise<KPattern> {
    return this.pattern;
  }

  private async onKeyDown(e: KeyboardEvent): Promise<void> {
    if (e.altKey || e.ctrlKey || e.metaKey || e.shiftKey) {
      return;
    }

    const algLeaf = keyToMove(e);
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
): Promise<KeyboardPuzzle> {
  return new KeyboardPuzzle(target);
}
