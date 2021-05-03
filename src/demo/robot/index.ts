import {
  BluetoothPuzzle,
  connectSmartPuzzle,
  debugKeyboardConnect,
  MoveEvent,
} from "../../cubing/bluetooth";
import { connectSmartRobot } from "../../cubing/bluetooth/smart-robot";
import type { GanRobot } from "../../cubing/bluetooth/smart-robot/GanRobot";
import type { TwistyPlayer } from "../../cubing/twisty";
import "../../cubing/twisty";
import { Alg } from "../../cubing/alg";
import { TwizzleStreamServer } from "../../cubing/stream/twizzle/TwizzleStream";

const BOGUS_VALUE = "BOGUS";

class RobotDemo {
  // DOM
  player: TwistyPlayer = document.querySelector("twisty-player")!;
  inputButton: HTMLButtonElement = document.querySelector("#input")!;
  getStreamsButton: HTMLButtonElement = document.querySelector("#get-streams")!;
  streamSelect: HTMLSelectElement = document.querySelector("#stream-select")!;

  streamServer = new TwizzleStreamServer();

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
    this.inputButton?.addEventListener(
      "click",
      this.connectBluetoothPuzzleInput.bind(this),
    );
    this.getStreamsButton.addEventListener("click", this.getStreams.bind(this));
    this.recorderButton.addEventListener(
      "click",
      this.connectRecorder.bind(this),
    );
    this.outputButton.addEventListener("click", this.connectOutput.bind(this));
    this.pauseButton.addEventListener("click", () => this.togglePause());
    this.connectKeyboardInput();

    this.streamSelect.addEventListener("change", () => this.onStreamSelect());
    // this.getStreams();
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

  async getStreams(): Promise<void> {
    const streams = await this.streamServer.streams();
    this.streamSelect.textContent = "";
    this.streamSelect.disabled = false;
    const info = this.streamSelect.appendChild(
      document.createElement("option"),
    );
    info.textContent = `Select a stream (${streams.length} available)`;
    info.value = BOGUS_VALUE;
    for (const stream of streams) {
      const firstSender = stream.senders[0];
      const option = this.streamSelect.appendChild(
        document.createElement("option"),
      );
      option.value = stream.streamID;
      option.textContent = firstSender.name;
    }
  }

  onStreamSelect(): void {
    const streamID = this.streamSelect.value;
    if (streamID === BOGUS_VALUE) {
      return;
    }
    const stream = this.streamServer.connect(streamID);
    stream.addEventListener("move", (moveEvent: CustomEvent) => {
      console.log("Incoming stream move:", moveEvent.detail.move.toString());
      this.onMove({
        latestMove: moveEvent.detail.move,
        timeStamp: Date.now(),
      });
    });
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
      // this.output.experimentalOptions.bufferQueue = 150;
      // this.output.experimentalOptions.postSleep = 100;
      this.output.experimentalOptions.singleMoveFixHack = true;
      this.output.experimentalOptions.xAngle = false;
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

  applyAlgString(s: string): void {
    const alg = Alg.fromString(s);
    for (const move of alg.experimentalLeafMoves()) {
      this.player.experimentalAddMove(move);
    }
    this.output?.applyMoves(Array.from(alg.experimentalLeafMoves()));
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
