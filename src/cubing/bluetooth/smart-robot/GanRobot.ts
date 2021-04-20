import { Move } from "../../alg";
import { BluetoothConfig } from "../smart-puzzle/bluetooth-puzzle";

// TODO: Short IDs
const UUIDs = {
  ganTimerService: "0000fff0-0000-1000-8000-00805f9b34fb",
  moveCharacteristic: "0000fff3-0000-1000-8000-00805f9b34fb",
};

const moveMap: Record<string, number> = {
  "B": 0,
  "B2": 1,
  "B'": 2,
  "R": 3,
  "R2": 4,
  "R'": 5,
  "D": 6,
  "D2": 7,
  "D'": 8,
  "F": 9,
  "F2": 10,
  "F'": 11,
  "L": 12,
  "L2": 13,
  "L'": 14,
};

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

  async applyMoves(moves: Iterable<Move>): Promise<void> {
    // const nibbles: number[] = [];
    for (const move of moves) {
      const str = move.toString();
      if (str in moveMap) {
        const nibble = moveMap[str];
        // nibbles.push(nibble);
        const msg = new Uint8Array(1);
        msg[0] = 0x10 * nibble + 0xf;
        console.log({ nibble, msg });
        await this.moveCharacteristic.writeValue(msg);
      } else if (move.family === "U") {
        const middle: number = {
          "1": 0x6c,
          "2": 0x7c,
          "-1": 0x8c,
        }[move.effectiveAmount]!;
        await this.moveCharacteristic.writeValue(
          new Uint8Array([0xc3, 0xa1, 0xe5, middle, 0x3a, 0x1e, 0x5f]),
        );
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
