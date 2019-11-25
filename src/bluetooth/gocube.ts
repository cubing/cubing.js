import { Quaternion } from "three";
import { BareBlockMove, BlockMove, Sequence } from "../alg";
import { BluetoothConfig, BluetoothPuzzle } from "./bluetooth-puzzle";
import { debugLog } from "./debug";

const UUIDs = {
  goCubeService: "6e400001-b5a3-f393-e0a9-e50e24dcca9e",
  goCubeStateCharacteristic: "6e400003-b5a3-f393-e0a9-e50e24dcca9e",
};

// TODO: Move this into a factory?
export const goCubeConfig: BluetoothConfig = {
  filters: [
    { namePrefix: "GoCube" },
  ],
  optionalServices: [
    UUIDs.goCubeService,
  ],
};

// https://stackoverflow.com/a/40031979
function buf2hex(buffer: ArrayBuffer): string { // buffer is an ArrayBuffer
  return Array.prototype.map.call(new Uint8Array(buffer), (x: number) => ("00" + x.toString(16)).slice(-2)).join("");
}

function bufferToString(buffer: ArrayBuffer): string {
  const byteView = new Uint8Array(buffer);
  let str = "";
  for (const charCode of byteView) {
    str += String.fromCharCode(charCode);
  }
  return str;
}

const moveMap: BlockMove[] = [
  BareBlockMove("B", 1),
  BareBlockMove("B", -1),
  BareBlockMove("F", 1),
  BareBlockMove("F", -1),
  BareBlockMove("U", 1),
  BareBlockMove("U", -1),
  BareBlockMove("D", 1),
  BareBlockMove("D", -1),
  BareBlockMove("R", 1),
  BareBlockMove("R", -1),
  BareBlockMove("L", 1),
  BareBlockMove("L", -1),
];

export class GoCube extends BluetoothPuzzle {

  // We have to perform async operations before we call the constructor.
  public static async connect(server: BluetoothRemoteGATTServer): Promise<GoCube> {
    const service = await server.getPrimaryService(UUIDs.goCubeService);
    debugLog({ service });
    const goCubeStateCharacteristic = await service.getCharacteristic(UUIDs.goCubeStateCharacteristic);
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
  private alg: Sequence = new Sequence([]);

  private constructor(private server: BluetoothRemoteGATTServer, public goCubeStateCharacteristic: BluetoothRemoteGATTCharacteristic) {
    super();
  }

  public reset(): void {
    this.resetAlg();
    this.resetOrientation();
  }

  public resetAlg(algo?: Sequence): void {
    this.alg = algo || new Sequence([]);
  }

  public resetOrientation(): void {
    this.homeQuatInverse = this.lastRawQuat.clone().inverse();
    this.currentQuat = new Quaternion(0, 0, 0, 1);
    this.lastTarget = new Quaternion(0, 0, 0, 1);
  }

  public name(): string | undefined {
    return this.server.device.name;
  }

  private onCubeCharacteristicChanged(event: any): void {
    const buffer: DataView = event.target.value;
    this.recorded.push([event.timeStamp, buf2hex(buffer.buffer)]);
    if (buffer.byteLength === 8) {
      const move = moveMap[buffer.getUint8(3)];
      this.alg = new Sequence(this.alg.nestedUnits.concat([move]));
      this.dispatchMove({
        latestMove: moveMap[buffer.getUint8(3)],
        timeStamp: event.timeStamp,
        debug: {
          stateStr: buf2hex(buffer.buffer),
        },
      });
    } else {
      const coords = bufferToString(buffer.buffer.slice(3, buffer.byteLength - 3)).split("#").map((s) => parseInt(s, 10) / 16384);
      const quat = new Quaternion(coords[0], coords[1], coords[2], coords[3]);

      this.lastRawQuat = quat.clone();

      if (!this.homeQuatInverse) {
        this.homeQuatInverse = quat.clone().inverse();
      }

      const targetQuat = quat.clone().multiply(this.homeQuatInverse!.clone());
      targetQuat.y = -targetQuat.y; // GoCube axis fix.

      this.lastTarget.slerp(targetQuat, 0.5);
      this.currentQuat.rotateTowards(this.lastTarget, rotateTowardsRate);

      const { x, y, z, w } = this.currentQuat;
      this.dispatchOrientation({
        quaternion: { x, y, z, w },
        timeStamp: event.timeStamp,
      });
    }
  }
}

const rotateTowardsRate = 0.5;
