import type { KeyboardPuzzle } from "../../../bluetooth/keyboard";
import type {
  BluetoothPuzzle,
  MoveEvent,
} from "../../../bluetooth/smart-puzzle/bluetooth-puzzle";
import type { PuzzleStreamMoveEventRegisterCompatible } from "../../../stream/process/ReorientedStream";
import { ManagedCustomElement } from "../element/ManagedCustomElement";
import { customElementsShim } from "../element/node-custom-element-shims";
import { twistyStreamSourceCSS } from "./TwistyStreamSource.css";

interface StreamSource extends EventTarget {
  disconnect?: () => void;
}

class BluetoothStreamSource extends EventTarget {
  private constructor(private puzzle: BluetoothPuzzle) {
    super();
    puzzle.addMoveListener((e: MoveEvent) => {
      this.dispatchEvent(
        new CustomEvent("move", {
          detail: {
            move: e.latestMove,
          },
        }),
      );
    });
  }

  static async connect(): Promise<BluetoothStreamSource> {
    const bluetooth = await import("../../../bluetooth");
    const puzzle = await bluetooth.connectSmartPuzzle();
    return new BluetoothStreamSource(puzzle);
  }

  disconnect(): void {
    this.puzzle.disconnect();
  }
}

class KeyboardStreamSource extends EventTarget {
  private constructor(puzzle: KeyboardPuzzle) {
    super();
    puzzle.addMoveListener((e: MoveEvent) => {
      this.dispatchEvent(
        new CustomEvent("move", {
          detail: {
            move: e.latestMove,
          },
        }),
      );
    });
  }

  static async connect(): Promise<KeyboardStreamSource> {
    const bluetooth = await import("../../../bluetooth");
    const puzzle = await bluetooth.debugKeyboardConnect();
    return new KeyboardStreamSource(puzzle);
  }

  disconnect(): void {
    throw new Error("unplmemented;");
  }
}

export class TwistyStreamSource extends ManagedCustomElement {
  constructor() {
    super();
    this.addCSS(twistyStreamSourceCSS);

    this.addElement(document.createElement("span")).textContent =
      "Connect a stream source:";

    this.addSource("📡 Bluetooth", BluetoothStreamSource);
    this.addSource("⌨️ Keyboard", KeyboardStreamSource);
  }

  addSource(
    label: string,
    sourceClass: { connect: () => Promise<StreamSource> },
  ): void {
    const button = this.addElement(document.createElement("button"));
    button.textContent = label;
    button.addEventListener("click", async () => {
      const source = await sourceClass.connect();
      button.disabled = true;
      button.textContent += " ✅";
      source.addEventListener(
        "move",
        (e: PuzzleStreamMoveEventRegisterCompatible) => {
          this.dispatchEvent(new CustomEvent("move", e));
        },
      );
    });
  }
}

customElementsShim.define("twisty-stream-source", TwistyStreamSource);
