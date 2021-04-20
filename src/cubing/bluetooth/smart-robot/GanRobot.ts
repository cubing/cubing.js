import { Move } from "../../alg";
import { BluetoothConfig } from "../smart-puzzle/bluetooth-puzzle";

const MAX_NIBBLES_PER_WRITE = 18 * 2;
// const WRITE_DEBOUNCE_MS = 500;
const QUARTER_TURN_DURATION_MS = 150;
const WRITE_PADDING_MS = 100;

// TODO: Short IDs
const UUIDs = {
  ganTimerService: "0000fff0-0000-1000-8000-00805f9b34fb",
  moveCharacteristic: "0000fff3-0000-1000-8000-00805f9b34fb",
};

const moveMap: Record<string, number> = {
  "R": 0,
  "R2": 1,
  "R'": 2,
  "F": 3,
  "F2": 4,
  "F'": 5,
  "D": 6,
  "D2": 7,
  "D'": 8,
  "L": 9,
  "L2": 10,
  "L'": 11,
  "B": 12,
  "B2": 13,
  "B'": 14,
};

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
      throw new Error("Can only write 40 nibbles at a time!");
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
    await Promise.all([
      this.moveCharacteristic.writeValue(bytes),
      sleep(QUARTER_TURN_DURATION_MS * nibbles.length + WRITE_PADDING_MS),
    ]);
  }

  locked: boolean = false;
  processQueue(): void {}

  private nibbleQueue: number[] = [];
  private async queueNibbles(nibbles: number[]): Promise<void> {
    this.nibbleQueue = this.nibbleQueue.concat(nibbles);
    console.log("queue:", this.nibbleQueue, this.locked);
    if (!this.locked) {
      console.log("locking");
      this.locked = true;
      while (this.nibbleQueue.length > 0) {
        const write = this.writeNibbles(
          this.nibbleQueue.splice(0, MAX_NIBBLES_PER_WRITE),
        );
        await write;
      }
      this.locked = false;
      console.log("locking resolved");
    }
  }

  async applyMoves(moves: Iterable<Move>): Promise<void> {
    // const nibbles: number[] = [];
    for (const move of moves) {
      const str = move.toString();
      if (str in moveMap) {
        const nibble = moveMap[str];
        await this.queueNibbles([nibble]);
      } else if (move.family === "U") {
        const middle: number = {
          "1": 0x6,
          "2": 0x7,
          "-1": 0x8,
        }[move.effectiveAmount]!;
        await this.queueNibbles([
          0x3,
          0xc,
          0x1,
          0xa,
          0x5,
          0xe,
          middle,
          0xc,
          0x3,
          0xa,
          0x1,
          0x5,
          0xe,
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
