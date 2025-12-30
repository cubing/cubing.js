import { Quaternion } from "three/src/math/Quaternion.js";
import { Alg, experimentalAppendMove, Move } from "../../alg";
import { debugLog } from "../debug";
import {
  type BluetoothConfig,
  BluetoothPuzzle,
  type ConnectionArguments,
} from "./bluetooth-puzzle";

const UUIDs = {
  goCubeService: "6e400001-b5a3-f393-e0a9-e50e24dcca9e",
  goCubeStateCharacteristic: "6e400003-b5a3-f393-e0a9-e50e24dcca9e",
};

// https://stackoverflow.com/a/40031979
function buf2hex(buffer: ArrayBuffer): string {
  // buffer is an ArrayBuffer
  return (
    Array.prototype.map.call(new Uint8Array(buffer), (x: number) =>
      `00${x.toString(16)}`.slice(-2),
    ) as string[]
  ).join(" ");
}

function bufferToString(buffer: ArrayBuffer): string {
  const byteView = new Uint8Array(buffer);
  let str = "";
  for (const charCode of byteView) {
    str += String.fromCharCode(charCode);
  }
  return str;
}

const moveMap: Move[] = [
  new Move("B", 1),
  new Move("B", -1),
  new Move("F", 1),
  new Move("F", -1),
  new Move("U", 1),
  new Move("U", -1),
  new Move("D", 1),
  new Move("D", -1),
  new Move("R", 1),
  new Move("R", -1),
  new Move("L", 1),
  new Move("L", -1),
];

/** @category Smart Puzzles */
export class GoCube extends BluetoothPuzzle {
  // We have to perform async operations before we call the constructor.
  public static async connect({
    server,
  }: ConnectionArguments): Promise<GoCube> {
    const service = await server.getPrimaryService(UUIDs.goCubeService);
    debugLog({ service });
    const goCubeStateCharacteristic = await service.getCharacteristic(
      UUIDs.goCubeStateCharacteristic,
    );
    debugLog({ goCubeStateCharacteristic });

    const cube = new GoCube(server, goCubeStateCharacteristic);

    await goCubeStateCharacteristic.startNotifications();
    goCubeStateCharacteristic.addEventListener(
      "characteristicvaluechanged",
      cube.onCubeCharacteristicChanged.bind(cube),
    );

    return cube;
  }

  // public async getState(): Promise<PuzzleState> {
  //   return new Promise((resolve, reject) => {
  //     this.resolve = (value: any) => {
  //       resolve(buf2hex(value.buffer) as any);
  //     };
  //     this.goCubeStateCharacteristic.startNotifications();
  //   });
  // }

  private recorded: any[][] = [];

  private homeQuatInverse: Quaternion | null = null;
  private lastRawQuat: Quaternion = new Quaternion(0, 0, 0, 1);
  private currentQuat: Quaternion = new Quaternion(0, 0, 0, 1);
  private lastTarget: Quaternion = new Quaternion(0, 0, 0, 1);
  private alg: Alg = new Alg();

  private constructor(
    private server: BluetoothRemoteGATTServer,
    public goCubeStateCharacteristic: BluetoothRemoteGATTCharacteristic,
  ) {
    super();
  }

  disconnect(): void {
    this.server.disconnect();
  }

  public reset(): void {
    this.resetAlg();
    this.resetOrientation();
  }

  public resetAlg(alg?: Alg): void {
    this.alg = alg || new Alg();
  }

  public resetOrientation(): void {
    this.homeQuatInverse = this.lastRawQuat.clone().invert();
    this.currentQuat = new Quaternion(0, 0, 0, 1);
    this.lastTarget = new Quaternion(0, 0, 0, 1);
  }

  public name(): string | undefined {
    return this.server.device.name;
  }

  private onCubeCharacteristicChanged(event: any): void {
    const buffer: DataView<ArrayBuffer> = event.target.value;
    this.recorded.push([event.timeStamp, buf2hex(buffer.buffer)]);
    // TODO: read bytes from buffer instead of guessing meaning based on length.
    if (buffer.byteLength < 16) {
      for (let i = 3; i < buffer.byteLength - 4; i += 2) {
        const move = moveMap[buffer.getUint8(i)];
        this.alg = experimentalAppendMove(this.alg, move);
        this.dispatchAlgLeaf({
          latestAlgLeaf: moveMap[buffer.getUint8(i)],
          timeStamp: event.timeStamp,
          debug: {
            stateStr: buf2hex(buffer.buffer),
          },
        });
      }
    } else {
      const coords = bufferToString(
        buffer.buffer.slice(3, buffer.byteLength - 3),
      )
        .split("#")
        .map((s) => parseInt(s, 10) / 16384);
      const quat = new Quaternion(coords[0], coords[1], coords[2], coords[3]);

      this.lastRawQuat = quat.clone();

      if (!this.homeQuatInverse) {
        this.homeQuatInverse = quat.clone().invert();
      }

      const targetQuat = quat.clone().multiply(this.homeQuatInverse.clone());
      targetQuat.y = -targetQuat.y; // GoCube axis fix.

      this.lastTarget.slerp(targetQuat, 0.5);
      this.currentQuat.rotateTowards(this.lastTarget, rotateTowardsRate);

      this.dispatchOrientation({
        quaternion: this.currentQuat,
        timeStamp: event.timeStamp,
      });
    }
  }
}

const rotateTowardsRate = 0.5;

// TODO: Move this into a factory?
export const goCubeConfig: BluetoothConfig<BluetoothPuzzle> = {
  connect: GoCube.connect.bind(GoCube),
  prefixes: ["GoCube", "Rubik"],
  filters: [{ namePrefix: "GoCube" }, { namePrefix: "Rubik" }],
  optionalServices: [UUIDs.goCubeService],
};
