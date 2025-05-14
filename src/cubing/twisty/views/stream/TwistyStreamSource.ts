import { Move } from "../../../alg";
import type { KeyboardPuzzle } from "../../../bluetooth/keyboard";
import type {
  AlgLeafEvent,
  BluetoothPuzzle,
} from "../../../bluetooth/smart-puzzle/bluetooth-puzzle";
import type { ExperimentalTwizzleStreamServer } from "../../../stream";
import type { PuzzleStreamMoveEventRegisterCompatible } from "../../../stream/process/ReorientedStream";
import { ManagedCustomElement } from "../ManagedCustomElement";
import { customElementsShim } from "../node-custom-element-shims";
import { twistyStreamSourceCSS } from "./TwistyStreamSource.css";

interface StreamSource extends EventTarget {
  disconnect?: () => void;
}

class BluetoothStreamSource extends EventTarget {
  private constructor(private puzzle: BluetoothPuzzle) {
    super();
    puzzle.addAlgLeafListener((e: AlgLeafEvent): void => {
      const move = e.latestAlgLeaf.as(Move);
      if (!move) {
        return;
      }
      this.dispatchEvent(
        new CustomEvent("move", {
          detail: {
            move,
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
  private constructor(private puzzle: KeyboardPuzzle) {
    super();
    puzzle.addAlgLeafListener((e: AlgLeafEvent) => {
      const move = e.latestAlgLeaf.as(Move);
      if (!move) {
        return;
      }
      this.dispatchEvent(
        new CustomEvent("move", {
          detail: {
            move,
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
    this.puzzle.disconnect();
  }
}

export class TwistyStreamSource extends ManagedCustomElement {
  constructor() {
    super();
    this.addCSS(twistyStreamSourceCSS);

    this.addElement(document.createElement("span")).textContent =
      "Connect a stream source:";

    const bluetoothButton = this.addSource(
      "📡 Bluetooth",
      BluetoothStreamSource,
    );
    this.addSource("⌨️ Keyboard", KeyboardStreamSource);
    this.addStreamSource();

    if (!navigator?.bluetooth) {
      bluetoothButton.disabled = true;
    }
  }

  addSource(
    label: string,
    sourceClass: { connect: () => Promise<StreamSource> },
  ): HTMLButtonElement {
    const button = this.addElement(document.createElement("button"));
    button.textContent = label;
    button.addEventListener("click", async () => {
      const source = await sourceClass.connect();
      button.disabled = true;
      button.textContent += " ✅";
      source.addEventListener(
        "move",
        ((e: PuzzleStreamMoveEventRegisterCompatible) => {
          this.dispatchEvent(new CustomEvent("move", e));
        }) as any as EventListener, // TODO: https://github.com/microsoft/TypeScript/issues/28357
      );
      // TODO: Hook up UI for disconnection.
    });
    return button;
  }

  addStreamSource(): void {
    const SENTINEL_VALUE = "SENTINEL";
    const button = this.addElement(document.createElement("button"));
    button.textContent = "🔴 Get Twizzle streams";

    const select = this.addElement(document.createElement("select"));
    select.appendChild(document.createElement("option")).textContent =
      "Streams";
    select.disabled = true;

    let streamServer: ExperimentalTwizzleStreamServer | null = null;
    button.addEventListener("click", async () => {
      const TwizzleStreamServer = (await import("../../../stream"))
        .ExperimentalTwizzleStreamServer;
      streamServer ||= new TwizzleStreamServer();
      const streams = await streamServer.streams();
      select.textContent = "";
      select.disabled = false;
      const info = select.appendChild(document.createElement("option"));
      info.textContent = `Select a stream (${streams.length} available)`;
      info.value = SENTINEL_VALUE;
      for (const stream of streams) {
        const firstSender = stream.senders[0];
        const option = select.appendChild(document.createElement("option"));
        option.value = stream.streamID;
        option.textContent = `${firstSender.name} (${stream.streamID.slice(
          -2,
        )})`;
      }
    });

    select.addEventListener("change", () => {
      const streamID = select.value;
      if (streamID === SENTINEL_VALUE) {
        return;
      }
      const stream = streamServer!.connect(streamID);
      stream.addEventListener(
        "move",
        ((moveEvent: PuzzleStreamMoveEventRegisterCompatible) => {
          console.log(moveEvent);
          this.dispatchEvent(new CustomEvent("move", moveEvent));
        }) as any as EventListener, // TODO: https://github.com/microsoft/TypeScript/issues/28357
      );
    });
  }
}

customElementsShim.define("twisty-stream-source", TwistyStreamSource);
declare global {
  interface HTMLElementTagNameMap {
    "twisty-stream-source": TwistyStreamSource;
  }
}
