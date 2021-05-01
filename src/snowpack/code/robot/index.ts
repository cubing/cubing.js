import {
  BluetoothPuzzle,
  connectSmartPuzzle,
  debugKeyboardConnect,
  MoveEvent,
} from "../../../cubing/bluetooth";
import { connectSmartRobot } from "../../../cubing/bluetooth/smart-robot";
import type { GanRobot } from "../../../cubing/bluetooth/smart-robot/GanRobot";
import type { TwistyPlayer } from "../../../cubing/twisty";
import "../../../cubing/twisty";
import type { Alg } from "../../../cubing/alg";

class RobotDemo {
  // DOM
  player: TwistyPlayer = document.querySelector("twisty-player")!;
  inputButton: HTMLButtonElement = document.querySelector("#input")!;
  outputButton: HTMLButtonElement = document.querySelector("#output")!;
  recorderButton: HTMLButtonElement = document.querySelector("#recorder")!;
  pauseButton: HTMLButtonElement = document.querySelector("#pause")!;
  // Devices
  inputs: BluetoothPuzzle[] = [];
  output: GanRobot | null = null;
  paused: boolean = false;

  sentStorageName: string;
  recorderStorageName: string;

  constructor() {
    this.inputButton.addEventListener(
      "click",
      this.connectBluetoothPuzzleInput.bind(this),
    );
    this.recorderButton.addEventListener(
      "click",
      this.connectRecorder.bind(this),
    );
    this.outputButton.addEventListener("click", this.connectOutput.bind(this));
    this.pauseButton.addEventListener("click", () => this.togglePause());
    this.connectKeyboardInput();
  }

  resetSession(): void {
    const date = Date.now();
    console.log("Setting session:", date);
    this.sentStorageName = `robot-sent-${date}`;
    this.recorderStorageName = `robot-recorded-${date}`;
  }

  async connectKeyboardInput(): Promise<void> {
    const kb = await debugKeyboardConnect();
    kb.addMoveListener(this.onMove.bind(this));
  }

  async connectRecorder(): Promise<void> {
    this.recorderButton.disabled = true;
    try {
      const puzzle = await connectSmartPuzzle();
      this.inputs.push(puzzle);
      puzzle.addMoveListener(this.recordMove.bind(this));
      this.recorderButton.textContent = `Recorder: ${puzzle.name()}`;
    } catch {
      this.recorderButton.disabled = false;
    }
  }

  async connectBluetoothPuzzleInput(): Promise<void> {
    this.inputButton.disabled = true;
    try {
      const puzzle = await connectSmartPuzzle();
      this.inputs.push(puzzle);
      puzzle.addMoveListener(this.onMove.bind(this));
      this.inputButton.textContent = `Input: ${puzzle.name()}`;
    } catch {
      this.inputButton.disabled = false;
    }
    this.pauseButton.disabled = false;
  }

  async connectOutput(): Promise<void> {
    this.outputButton.disabled = true;
    try {
      this.output = await connectSmartRobot();
      this.output.experimentalDebugLog = console.log;
      this.output.experimentalOptions.bufferQueue = 150;
      this.output.experimentalOptions.postSleep = 100;
      this.output.experimentalOptions.singleMoveFixHack = true;
      this.output.experimentalOptions.xAngle = true;
      this.output.experimentalDebugOnSend = (alg: Alg) => {
        localStorage[this.sentStorageName] =
          (localStorage[this.sentStorageName] ?? "") +
          alg.toString() +
          ` // ${Date.now()}\n`;
      };
      this.outputButton.textContent = `Output: ${this.output.name()}`;
    } catch {
      this.outputButton.disabled = false;
    }
  }

  onMove(move: MoveEvent): void {
    this.player.experimentalAddMove(move.latestMove);
    if (this.paused) {
      console.log("Paused. Not sending moves.");
    } else {
      this.output?.applyMoves([move.latestMove]);
    }
  }

  recordMove(moveEvent: MoveEvent): void {
    localStorage[this.recorderStorageName] =
      (localStorage[this.recorderStorageName] ?? "") +
      moveEvent.latestMove.toString() +
      ` // ${Date.now()}\n`;
  }

  togglePause(newPause?: boolean): void {
    if (typeof newPause === "undefined") {
      this.togglePause(!this.paused);
      return;
    }
    console.log("Setting pause:", newPause);
    this.resetSession();
    if (newPause) {
      this.pauseButton.textContent = "▶️";
      this.paused = newPause;
    } else {
      this.pauseButton.textContent = "⏸";
      this.paused = newPause;
    }
  }
}

(window as any).robotDemo = new RobotDemo();
