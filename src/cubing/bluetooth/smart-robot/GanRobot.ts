import { Alg, Move } from "../../alg";
import { BluetoothConfig } from "../smart-puzzle/bluetooth-puzzle";

const MAX_NIBBLES_PER_WRITE = 18 * 2;
// const WRITE_DEBOUNCE_MS = 500;
const QUANTUM_TURN_DURATION_MS = 150;
const DOUBLE_TURN_DURATION_MS = 250;
const WRITE_PADDING_MS = 100;

// const U_D_SWAP = new Alg("F B R2 L2 B' F'");
const U_D_SWAP = new Alg("U D R2 L2 D' U'");
const U_D_UNSWAP = U_D_SWAP.invert(); // TODO: make `cubing.js` clever enough to be able to reuse the regular swap.

// TODO: Short IDs
const UUIDs = {
  ganTimerService: "0000fff0-0000-1000-8000-00805f9b34fb",
  moveCharacteristic: "0000fff3-0000-1000-8000-00805f9b34fb",
};

const moveMap: Record<string, number> = {
  "R": 0,
  "R2": 1,
  "R2'": 1,
  "R'": 2,
  "U": 3,
  "U2": 4,
  "U2'": 4,
  "U'": 5,
  "F": 6,
  "F2": 7,
  "F2'": 7,
  "F'": 8,
  "L": 9,
  "L2": 10,
  "L2'": 10,
  "L'": 11,
  "D": 12,
  "D2": 13,
  "D2'": 13,
  "D'": 14,
};

function isDoubleTurnNibble(nibble: number): boolean {
  return nibble % 3 === 1;
}

function nibbleDuration(nibble: number): number {
  return isDoubleTurnNibble(nibble)
    ? DOUBLE_TURN_DURATION_MS
    : QUANTUM_TURN_DURATION_MS;
}

function throwInvalidMove(move: Move) {
  console.error("invalid move", move, move.toString());
  throw new Error("invalid move!");
}
function moveToNibble(move: Move): number {
  return moveMap[move.toString()] ?? throwInvalidMove(move);
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export class GanRobot extends EventTarget {
  constructor(
    _service: BluetoothRemoteGATTService,
    private server: BluetoothRemoteGATTServer,
    device: BluetoothDevice,
    private moveCharacteristic: BluetoothRemoteGATTCharacteristic,
  ) {
    super();
    device.addEventListener(
      "gattserverdisconnected",
      this.onDisconnect.bind(this),
    );
  }

  // We have to perform async operations before we call the constructor.
  static async connect(
    server: BluetoothRemoteGATTServer,
    device: BluetoothDevice,
  ) {
    const ganTimerService = await server.getPrimaryService(
      UUIDs.ganTimerService,
    );
    const moveCharacteristic = await ganTimerService.getCharacteristic(
      UUIDs.moveCharacteristic,
    );
    const timer = new GanRobot(
      ganTimerService,
      server,
      device,
      moveCharacteristic,
    );
    return timer;
  }

  disconnect(): void {
    this.server.disconnect();
  }

  onDisconnect(): void {
    this.dispatchEvent(new CustomEvent("disconnect"));
  }

  private async writeNibbles(nibbles: number[]): Promise<void> {
    if (nibbles.length > MAX_NIBBLES_PER_WRITE) {
      throw new Error(
        `Can only write ${MAX_NIBBLES_PER_WRITE} nibbles at a time!`,
      );
    }
    const byteLength = Math.ceil(nibbles.length / 2);
    const bytes = new Uint8Array(byteLength);
    for (let i = 0; i < nibbles.length; i++) {
      const byteIdx = Math.floor(i / 2);
      bytes[byteIdx] += nibbles[i];
      if (i % 2 === 0) {
        bytes[byteIdx] *= 0x10;
      }
    }
    if (nibbles.length % 2 === 1) {
      bytes[byteLength - 1] += 0xf;
    }
    console.log("SENDING:", nibbles);
    let sleepDuration = WRITE_PADDING_MS;
    for (const nibble of nibbles) {
      sleepDuration += nibbleDuration(nibble);
    }
    await Promise.all([
      this.moveCharacteristic.writeValue(bytes),
      sleep(sleepDuration),
    ]);
  }

  locked: boolean = false;
  processQueue(): void {}

  private moveQueue: Alg = new Alg();
  // TODO: Don't let this resolve until the move is done?
  private async queueMoves(moves: Alg): Promise<void> {
    this.moveQueue = this.moveQueue
      .concat(moves)
      .simplify({ collapseMoves: true, quantumMoveOrder: (_) => 4 });
    console.log(this.moveQueue.toString());
    if (!this.locked) {
      // TODO: We're currently iterating over units instead of leaves to avoid "zip bomps".

      try {
        console.log("locking");
        this.locked = true;
        while (this.moveQueue.experimentalNumUnits() > 0) {
          const units = Array.from(this.moveQueue.units());
          const nibbles = units
            .splice(0, MAX_NIBBLES_PER_WRITE)
            .map(moveToNibble);
          const write = this.writeNibbles(nibbles);
          this.moveQueue = new Alg(units);
          await write;
        }
      } finally {
        console.log("locking resolved");
        this.locked = false;
      }
    }
  }

  async applyMoves(moves: Iterable<Move>): Promise<void> {
    // const nibbles: number[] = [];
    for (const move of moves) {
      const str = move.toString();
      if (str in moveMap) {
        await this.queueMoves(new Alg([move]));
      } else if (move.family === "B") {
        // We purposely send just the swap, so that U2 will get coalesced
        await Promise.all([
          this.queueMoves(U_D_SWAP),
          this.queueMoves(
            new Alg([move.modified({ family: "F" })]).concat(U_D_UNSWAP),
          ),
        ]);
      }
    }
  }
}

// // TODO: Move this into a factory?
export const ganTimerConfig: BluetoothConfig<GanRobot> = {
  connect: GanRobot.connect,
  prefixes: ["GAN"],
  filters: [{ namePrefix: "GAN" }],
  optionalServices: [UUIDs.ganTimerService],
};
