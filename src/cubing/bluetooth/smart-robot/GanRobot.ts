import { Alg, Move } from "../../alg";
import { BluetoothConfig } from "../smart-puzzle/bluetooth-puzzle";

function buf2hex(buffer: ArrayBuffer): string {
  // buffer is an ArrayBuffer
  return Array.prototype.map
    .call(new Uint8Array(buffer), (x: number) =>
      ("00" + x.toString(16)).slice(-2),
    )
    .join(" ");
}

const DEFAULT_ANGLE = true;
const SINGLE_MOVE_FIX_HACK = true;
const PRE_SLEEP = true;

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
  ganRobotService: "0000fff0-0000-1000-8000-00805f9b34fb",
  statusCharacteristic: "0000fff2-0000-1000-8000-00805f9b34fb",
  moveCharacteristic: "0000fff3-0000-1000-8000-00805f9b34fb",
};

const moveMap: Record<string, number> = DEFAULT_ANGLE
  ? {
      "R": 0,
      "R2": 1,
      "R2'": 1,
      "R'": 2,
      "F": 3,
      "F2": 4,
      "F2'": 4,
      "F'": 5,
      "D": 6,
      "D2": 7,
      "D2'": 7,
      "D'": 8,
      "L": 9,
      "L2": 10,
      "L2'": 10,
      "L'": 11,
      "B": 12,
      "B2": 13,
      "B2'": 13,
      "B'": 14,
    }
  : {
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
  const nibble = moveMap[move.toString()] ?? null;
  if (nibble === null) {
    throwInvalidMove(move);
  }
  return nibble;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export interface GanRobotStatus {
  movesRemaining: number;
}

export class GanRobot extends EventTarget {
  debugOnSend: ((alg: Alg) => void) | null = null;

  constructor(
    _service: BluetoothRemoteGATTService,
    private server: BluetoothRemoteGATTServer,
    device: BluetoothDevice,
    private statusCharacteristic: BluetoothRemoteGATTCharacteristic,
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
      UUIDs.ganRobotService,
    );
    const statusCharacteristic = await ganTimerService.getCharacteristic(
      UUIDs.statusCharacteristic,
    );
    const moveCharacteristic = await ganTimerService.getCharacteristic(
      UUIDs.moveCharacteristic,
    );
    const timer = new GanRobot(
      ganTimerService,
      server,
      device,
      statusCharacteristic,
      moveCharacteristic,
    );
    return timer;
  }

  public name(): string | undefined {
    return this.server.device.name;
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
    // const byteLength = Math.ceil(nibbles.length / 2);
    const bytes = new Uint8Array(18);
    let i: number;
    for (i = 0; i < nibbles.length; i++) {
      const byteIdx = Math.floor(i / 2);
      bytes[byteIdx] += nibbles[i];
      if (i % 2 === 0) {
        bytes[byteIdx] *= 0x10;
      }
    }
    if (nibbles.length % 2 === 1) {
      bytes[Math.ceil(nibbles.length / 2) - 1] += 0xf;
    }
    for (let i = Math.ceil(nibbles.length / 2); i < 18; i++) {
      bytes[i] = 0xff;
    }
    let sleepDuration = WRITE_PADDING_MS;
    for (const nibble of nibbles) {
      sleepDuration += nibbleDuration(nibble);
    }
    console.log("WRITING:", buf2hex(bytes));
    await this.moveCharacteristic.writeValue(bytes);
    await sleep(sleepDuration * 0.75);
    while ((await this.getStatus()).movesRemaining > 0) {
      // repeat
    }
    await sleep(100);
  }

  private async getStatus(): Promise<GanRobotStatus> {
    const statusBytes = new Uint8Array(
      (await this.statusCharacteristic.readValue()).buffer,
    );
    console.log("moves remaining:", statusBytes[0]);
    return {
      movesRemaining: statusBytes[0],
    };
  }

  locked: boolean = false;
  processQueue(): void {}

  private moveQueue: Alg = new Alg();
  // TODO: Don't let this resolve until the move is done?
  private async queueMoves(moves: Alg): Promise<void> {
    this.moveQueue = this.moveQueue
      .concat(moves)
      .simplify({ collapseMoves: true, quantumMoveOrder: (_) => 4 });
    if (!this.locked) {
      // TODO: We're currently iterating over units instead of leaves to avoid "zip bomps".
      try {
        this.locked = true;
        const queueLen = this.moveQueue.experimentalNumUnits();
        if (PRE_SLEEP && queueLen === 1) {
          await sleep(150);
        }
        // await this.writeNibbles([0xf, 0xf]);
        while (queueLen > 0) {
          let units = Array.from(this.moveQueue.units());
          if (SINGLE_MOVE_FIX_HACK && units.length === 1) {
            const move = units[0] as Move;
            if (move.effectiveAmount === 2) {
              units = [
                move.modified({ repetition: 1 }),
                move.modified({ repetition: 1 }),
              ];
            } else {
              units = [
                move.modified({ repetition: -move.effectiveAmount }),
                move.modified({ repetition: 2 }),
              ];
            }
          }
          const moves = units.splice(0, MAX_NIBBLES_PER_WRITE);
          const nibbles = moves.map(moveToNibble);
          const sending = new Alg(moves);
          console.log("SENDING", sending.toString());
          if (this.debugOnSend) {
            this.debugOnSend(sending);
          }
          const write = this.writeNibbles(nibbles);
          this.moveQueue = new Alg(units);
          await write;
        }
      } finally {
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
      } else if (move.family === (DEFAULT_ANGLE ? "U" : "B")) {
        // We purposely send just the swap, so that U2 will get coalesced
        await Promise.all([
          this.queueMoves(U_D_SWAP),
          this.queueMoves(
            new Alg([
              move.modified({ family: DEFAULT_ANGLE ? "D" : "F" }),
            ]).concat(U_D_UNSWAP),
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
  optionalServices: [UUIDs.ganRobotService],
};
