import { Alg, Move as AlgNode, Move } from "../../alg";
import { cube3x3x3 } from "../../puzzles";
import type { BluetoothConfig } from "../smart-puzzle/bluetooth-puzzle";

// TODO: Remove this. It's only used for debugging.
function buf2hex(buffer: ArrayBuffer | Uint8Array): string {
  // buffer is an ArrayBuffer
  return (
    Array.prototype.map.call(new Uint8Array(buffer), (x: number) =>
      `00${x.toString(16)}`.slice(-2),
    ) as string[]
  ).join(" ");
}

const MAX_NIBBLES_PER_WRITE = 18 * 2;
const QUANTUM_TURN_DURATION_MS = 150;
const DOUBLE_TURN_DURATION_MS = 250;

const U_D_SWAP = new Alg("F B R2 L2 B' F'");
const U_D_UNSWAP = U_D_SWAP.invert(); // TODO: make `cubing.js` clever enough to be able to reuse the regular swap.
const F_B_SWAP = new Alg("U D R2 L2 D' U'");
const F_B_UNSWAP = F_B_SWAP.invert();

// TODO: Short IDs
const UUIDs = {
  ganRobotService: "0000fff0-0000-1000-8000-00805f9b34fb",
  statusCharacteristic: "0000fff2-0000-1000-8000-00805f9b34fb",
  moveCharacteristic: "0000fff3-0000-1000-8000-00805f9b34fb",
};

const moveMap: Record<string, number> = {
  R: 0,
  R2: 1,
  "R2'": 1,
  "R'": 2,
  F: 3,
  F2: 4,
  "F2'": 4,
  "F'": 5,
  D: 6,
  D2: 7,
  "D2'": 7,
  "D'": 8,
  L: 9,
  L2: 10,
  "L2'": 10,
  "L'": 11,
  B: 12,
  B2: 13,
  "B2'": 13,
  "B'": 14,
};

const moveMapX: Record<string, number> = {
  R: 0,
  R2: 1,
  "R2'": 1,
  "R'": 2,
  U: 3,
  U2: 4,
  "U2'": 4,
  "U'": 5,
  F: 6,
  F2: 7,
  "F2'": 7,
  "F'": 8,
  L: 9,
  L2: 10,
  "L2'": 10,
  "L'": 11,
  D: 12,
  D2: 13,
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

function throwInvalidAlgNode(algNode: AlgNode): never {
  console.error("invalid alg node", algNode, algNode.toString());
  throw new Error("invalid alg node!");
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export interface GanRobotStatus {
  movesRemaining: number;
}

interface GanRobotOptions {
  xAngle: boolean;
  singleMoveFixHack: boolean;
  bufferQueue: number;
  postSleep: number;
}

/** @category Robots */
export class GanRobot extends EventTarget {
  experimentalDebugOnSend: ((alg: Alg) => void) | null = null;
  experimentalDebugLog: typeof console.log = () => {};

  // Because our Bluetooth connection code is set up not to know what kind of device is connecting, we put these options directly on the class.
  experimentalOptions: GanRobotOptions = {
    xAngle: false,
    singleMoveFixHack: false,
    bufferQueue: 0,
    postSleep: 0,
  };

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

  private algNodeToNibble(algNode: AlgNode): number {
    const move = algNode.as(AlgNode);
    if (!move) {
      throwInvalidAlgNode(algNode);
    }
    const nibble =
      (this.experimentalOptions.xAngle ? moveMapX : moveMap)[move.toString()] ??
      null;
    if (nibble === null) {
      throwInvalidAlgNode(move);
    }
    return nibble;
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
    let sleepDuration = 0;
    for (const nibble of nibbles) {
      sleepDuration += nibbleDuration(nibble);
    }
    this.experimentalDebugLog("WRITING:", buf2hex(bytes));
    await this.moveCharacteristic.writeValue(bytes);
    await sleep(sleepDuration * 0.75);
    while ((await this.getStatus()).movesRemaining > 0) {
      // repeat
    }
    await sleep(this.experimentalOptions.postSleep);
  }

  private async getStatus(): Promise<GanRobotStatus> {
    const statusBytes = new Uint8Array(
      (await this.statusCharacteristic.readValue()).buffer,
    );
    this.experimentalDebugLog("moves remaining:", statusBytes[0]);
    return {
      movesRemaining: statusBytes[0],
    };
  }

  locked: boolean = false;
  processQueue(): void {}

  private moveQueue: Alg = new Alg();
  // TODO: Don't let this resolve until the move is done?
  private async queueMoves(moves: Alg): Promise<void> {
    this.moveQueue = this.moveQueue.concat(moves).experimentalSimplify({
      puzzleSpecificSimplifyOptions: cube3x3x3.puzzleSpecificSimplifyOptions,
    });
    if (!this.locked) {
      // TODO: We're currently iterating over alg nodes instead of leaves to avoid "zip bomps".
      try {
        this.locked = true;
        if (this.moveQueue.experimentalNumChildAlgNodes() === 1) {
          await sleep(this.experimentalOptions.bufferQueue);
        }
        // await this.writeNibbles([0xf, 0xf]);
        while (this.moveQueue.experimentalNumChildAlgNodes() > 0) {
          // @ts-ignore: Is TypeScript just straight-up false positiving here?
          let algNodes: AlgNode[] = Array.from(this.moveQueue.childAlgNodes());
          if (
            this.experimentalOptions.singleMoveFixHack &&
            algNodes.length === 1
          ) {
            const move = algNodes[0].as(Move);
            if (move) {
              if (move.amount === 2) {
                algNodes = [
                  move.modified({ amount: 1 }) as AlgNode,
                  move.modified({ amount: 1 }) as AlgNode,
                ];
              } else {
                algNodes = [
                  move.modified({ amount: -move.amount }),
                  move.modified({ amount: 2 }) as AlgNode,
                ];
              }
            }
          }
          const splicedAlgNodes: AlgNode[] = algNodes.splice(
            0,
            MAX_NIBBLES_PER_WRITE,
          );
          const nibbles: number[] = splicedAlgNodes.map(
            this.algNodeToNibble.bind(this),
          );
          const sending = new Alg(splicedAlgNodes);
          this.experimentalDebugLog("SENDING", sending.toString());
          if (this.experimentalDebugOnSend) {
            this.experimentalDebugOnSend(sending);
          }
          const write = this.writeNibbles(nibbles);
          this.moveQueue = new Alg(algNodes);
          await write;
        }
      } finally {
        this.locked = false;
      }
    }
  }

  async applyMoves(moves: Iterable<AlgNode>): Promise<void> {
    // const nibbles: number[] = [];
    for (const move of moves) {
      const str = move.toString();
      if (str in (this.experimentalOptions.xAngle ? moveMapX : moveMap)) {
        await this.queueMoves(new Alg([move]));
      } else if (
        move.family === (this.experimentalOptions.xAngle ? "B" : "U")
      ) {
        // We purposely send just the swap, so that U2 will get cancelled
        await Promise.all([
          this.queueMoves(
            this.experimentalOptions.xAngle ? F_B_SWAP : U_D_SWAP,
          ),
          this.queueMoves(
            new Alg([
              move.modified({
                family: this.experimentalOptions.xAngle ? "F" : "D",
              }),
            ]).concat(
              this.experimentalOptions.xAngle ? F_B_UNSWAP : U_D_UNSWAP,
            ),
          ),
        ]);
      }
    }
  }
}

// // TODO: Move this into a factory?
export const ganTimerConfig: BluetoothConfig<GanRobot> = {
  connect: GanRobot.connect.bind(GanRobot),
  prefixes: ["GAN"],
  filters: [{ namePrefix: "GAN" }],
  optionalServices: [UUIDs.ganRobotService],
};
