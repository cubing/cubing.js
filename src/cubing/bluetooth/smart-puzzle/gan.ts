/* tslint:disable no-bitwise */

import { Quaternion } from "three/src/math/Quaternion.js";
import { Move } from "../../alg";
import { KPattern, type KPuzzle } from "../../kpuzzle";
import { puzzles } from "../../puzzles";
import {
  importKey,
  unsafeDecryptBlock,
} from "../../vendor/public-domain/unsafe-raw-aes/unsafe-raw-aes";
import { debugLog } from "../debug";
import {
  type BluetoothConfig,
  BluetoothPuzzle,
  type ConnectionArguments,
} from "./bluetooth-puzzle";
import { getPatternData } from "./common";

// This needs to be short enough to capture 6 moves (OBQTM).
const DEFAULT_INTERVAL_MS = 150;
// Number of latest moves provided by the Gan 356i.
const MAX_LATEST_MOVES = 6;

const ganMoveToBlockMove: { [i: number]: Move } = {
  0 /*  0x00 */: new Move("U"),
  2 /*  0x02 */: new Move("U", -1),
  3 /*  0x03 */: new Move("R"),
  5 /*  0x05 */: new Move("R", -1),
  6 /*  0x06 */: new Move("F"),
  8 /*  0x08 */: new Move("F", -1),
  9 /*  0x09 */: new Move("D"),
  11 /* 0x0b */: new Move("D", -1),
  12 /* 0x0c */: new Move("L"),
  14 /* 0x0e */: new Move("L", -1),
  15 /* 0x0f */: new Move("B"),
  17 /* 0x11 */: new Move("B", -1),
};

let homeQuatInverse: Quaternion | null = null;

function probablyDecodedCorrectly(data: Uint8Array): boolean {
  return (
    data[13] < 0x12 &&
    data[14] < 0x12 &&
    data[15] < 0x12 &&
    data[16] < 0x12 &&
    data[17] < 0x12 &&
    data[18] < 0x12
  );
}

const key10 = new Uint8Array([
  198, 202, 21, 223, 79, 110, 19, 182, 119, 13, 230, 89, 58, 175, 186, 162,
]);
const key11 = new Uint8Array([
  67, 226, 91, 214, 125, 220, 120, 216, 7, 96, 163, 218, 130, 60, 1, 241,
]);

// Clean-room reverse-engineered
async function decryptPattern(
  data: Uint8Array,
  aesKey: CryptoKey | null,
): Promise<Uint8Array> {
  if (aesKey === null) {
    return data;
  }

  const copy = new Uint8Array(data);
  copy.set(new Uint8Array(await unsafeDecryptBlock(aesKey, copy.slice(3))), 3);
  copy.set(
    new Uint8Array(await unsafeDecryptBlock(aesKey, copy.slice(0, 16))),
    0,
  );

  if (probablyDecodedCorrectly(copy)) {
    return copy;
  }

  throw new Error("Invalid Gan cube pattern");
}

class PhysicalState {
  public static async read(
    characteristic: BluetoothRemoteGATTCharacteristic,
    aesKey: CryptoKey | null,
  ): Promise<PhysicalState> {
    const value = await decryptPattern(
      new Uint8Array((await characteristic.readValue()).buffer),
      aesKey,
    );
    const timeStamp = Date.now();
    // console.log(value);
    return new PhysicalState(new DataView(value.buffer), timeStamp);
  }

  private arr: Uint8Array;
  private arrLen = 19;
  private constructor(
    private dataView: DataView,
    public timeStamp: number,
  ) {
    this.arr = new Uint8Array(dataView.buffer);
    if (this.arr.length !== this.arrLen) {
      throw new Error("Unexpected array length");
    }
  }

  public rotQuat(): Quaternion {
    let x = this.dataView.getInt16(0, true) / 16384;
    let y = this.dataView.getInt16(2, true) / 16384;
    let z = this.dataView.getInt16(4, true) / 16384;
    [x, y, z] = [-y, z, -x];
    const wSquared = 1 - (x * x + y * y + z * z);
    const w = wSquared > 0 ? Math.sqrt(wSquared) : 0;
    const quat = new Quaternion(x, y, z, w);

    if (!homeQuatInverse) {
      homeQuatInverse = quat.clone().invert();
    }

    return quat.clone().multiply(homeQuatInverse.clone());
  }

  // Loops from 255 to 0.
  public moveCounter(): number {
    return this.arr[12];
  }

  public numMovesSince(previousMoveCounter: number): number {
    return (this.moveCounter() - previousMoveCounter) & 0xff;
  }

  // Due to the design of the Gan356i protocol, it's common to query for the
  // latest physical state and find 0 moves have been performed since the last
  // query. Therefore, it's useful to allow 0 as an argument.
  public latestMoves(n: number): Move[] {
    if (n < 0 || n > MAX_LATEST_MOVES) {
      throw new Error(`Must ask for 0 to 6 latest moves. (Asked for ${n})`);
    }
    return Array.from(this.arr.slice(19 - n, 19)).map(
      (i) => ganMoveToBlockMove[i],
    );
  }

  public debugInfo(): { arr: Uint8Array } {
    return {
      arr: this.arr,
    };
  }
}

// TODO: Short IDs
const UUIDs = {
  ganCubeService: "0000fff0-0000-1000-8000-00805f9b34fb",
  physicalStateCharacteristic: "0000fff5-0000-1000-8000-00805f9b34fb",
  actualAngleAndBatteryCharacteristic: "0000fff7-0000-1000-8000-00805f9b34fb",
  faceletStatus1Characteristic: "0000fff2-0000-1000-8000-00805f9b34fb",
  faceletStatus2Characteristic: "0000fff3-0000-1000-8000-00805f9b34fb",
  infoService: "0000180a-0000-1000-8000-00805f9b34fb",
  systemIDCharacteristic: "00002a23-0000-1000-8000-00805f9b34fb",
  versionCharacteristic: "00002a28-0000-1000-8000-00805f9b34fb",
};

const commands: { [cmd: string]: BufferSource } = {
  reset: new Uint8Array([
    0x00, 0x00, 0x24, 0x00, 0x49, 0x92, 0x24, 0x49, 0x6d, 0x92, 0xdb, 0xb6,
    0x49, 0x92, 0xb6, 0x24, 0x6d, 0xdb,
  ]),
};

function buf2hex(buffer: ArrayBufferLike): string {
  // buffer is an ArrayBuffer
  return (
    Array.prototype.map.call(new Uint8Array(buffer), (x: number) =>
      `00${x.toString(16)}`.slice(-2),
    ) as string[]
  ).join(" ");
}

const gan356iCornerMappings = [
  [0, 21, 15],
  [5, 13, 47],
  [7, 45, 39],
  [2, 37, 23],
  [29, 10, 16],
  [31, 18, 32],
  [26, 34, 40],
  [24, 42, 8],
];

const gan356iEdgeMappings = [
  [1, 22],
  [3, 14],
  [6, 46],
  [4, 38],
  [30, 17],
  [27, 9],
  [25, 41],
  [28, 33],
  [19, 12],
  [20, 35],
  [44, 11],
  [43, 36],
];
const faceOrder = "URFDLB";

async function getKey(
  server: BluetoothRemoteGATTServer,
): Promise<CryptoKey | null> {
  const infoService = await server.getPrimaryService(UUIDs.infoService);

  const versionCharacteristic = await infoService.getCharacteristic(
    UUIDs.versionCharacteristic,
  );
  const versionBuffer = new Uint8Array(
    (await versionCharacteristic.readValue()).buffer,
  );

  const versionValue =
    (((versionBuffer[0] << 8) + versionBuffer[1]) << 8) + versionBuffer[2];
  if (versionValue < 0x01_00_08) {
    return null;
  }

  const keyXor = versionValue < 0x01_01_00 ? key10 : key11;

  const systemIDCharacteristic = await infoService.getCharacteristic(
    UUIDs.systemIDCharacteristic,
  );
  const systemID = new Uint8Array(
    (await systemIDCharacteristic.readValue()).buffer,
  ).reverse();

  const key = new Uint8Array(keyXor);
  for (let i = 0; i < systemID.length; i++) {
    key[i] = (key[i] + systemID[i]) % 256;
  }

  return importKey(key);
}

/** @category Smart Puzzles */
export class GanCube extends BluetoothPuzzle {
  // We have to perform async operations before we call the constructor.
  public static async connect({
    server,
  }: ConnectionArguments): Promise<GanCube> {
    const ganCubeService = await server.getPrimaryService(UUIDs.ganCubeService);
    debugLog("Service:", ganCubeService);

    const physicalStateCharacteristic = await ganCubeService.getCharacteristic(
      UUIDs.physicalStateCharacteristic,
    );
    debugLog("Characteristic:", physicalStateCharacteristic);

    const aesKey = await getKey(server);

    const initialMoveCounter = (
      await PhysicalState.read(physicalStateCharacteristic, aesKey)
    ).moveCounter();
    debugLog("Initial Move Counter:", initialMoveCounter);
    const cube = new GanCube(
      await puzzles["3x3x3"].kpuzzle(),
      ganCubeService,
      server,
      physicalStateCharacteristic,
      initialMoveCounter,
      aesKey,
    );
    return cube;
  }

  public INTERVAL_MS: number = DEFAULT_INTERVAL_MS;
  private intervalHandle: number | null = null;
  private pattern: KPattern;
  private cachedFaceletStatus1Characteristic:
    | Promise<BluetoothRemoteGATTCharacteristic>
    | undefined;

  private cachedFaceletStatus2Characteristic:
    | Promise<BluetoothRemoteGATTCharacteristic>
    | undefined;

  private cachedActualAngleAndBatteryCharacteristic:
    | Promise<BluetoothRemoteGATTCharacteristic>
    | undefined;

  private constructor(
    private kpuzzle: KPuzzle,
    private service: BluetoothRemoteGATTService,
    private server: BluetoothRemoteGATTServer,
    private physicalStateCharacteristic: BluetoothRemoteGATTCharacteristic,
    private lastMoveCounter: number,
    private aesKey: CryptoKey | null,
  ) {
    super();
    this.pattern = kpuzzle.defaultPattern();
    this.startTrackingMoves();
  }

  public name(): string | undefined {
    return this.server.device.name;
  }

  disconnect(): void {
    this.server.disconnect();
  }

  public startTrackingMoves(): void {
    // `window.setInterval` instead of `setInterval`:
    // https://github.com/Microsoft/TypeScript/issues/842#issuecomment-252445883
    this.intervalHandle = window.setInterval(
      this.intervalHandler.bind(this),
      this.INTERVAL_MS,
    );
  }

  public stopTrackingMoves(): void {
    if (!this.intervalHandle) {
      throw new Error("Not tracking moves!");
    }
    clearInterval(this.intervalHandle);
    this.intervalHandle = null;
  }

  // TODO: Can we ever receive async responses out of order?
  public async intervalHandler(): Promise<void> {
    const physicalState = await PhysicalState.read(
      this.physicalStateCharacteristic,
      this.aesKey,
    );
    let numInterveningMoves = physicalState.numMovesSince(this.lastMoveCounter);
    // console.log(numInterveningMoves);
    if (numInterveningMoves > MAX_LATEST_MOVES) {
      debugLog(
        `Too many moves! Dropping ${
          numInterveningMoves - MAX_LATEST_MOVES
        } moves`,
      );
      numInterveningMoves = MAX_LATEST_MOVES;
    }
    for (const move of physicalState.latestMoves(numInterveningMoves)) {
      // console.log(move);
      this.pattern = this.pattern.applyMove(move);
      this.dispatchAlgLeaf({
        latestAlgLeaf: move,
        timeStamp: physicalState.timeStamp,
        debug: physicalState.debugInfo(),
        pattern: this.pattern,
        // quaternion: physicalState.rotQuat(),
      });
    }
    this.dispatchOrientation({
      timeStamp: physicalState.timeStamp,
      quaternion: physicalState.rotQuat(),
    });
    this.lastMoveCounter = physicalState.moveCounter();
  }

  public async getBattery(): Promise<number> {
    return new Uint8Array(
      await this.readActualAngleAndBatteryCharacteristic(),
    )[7];
  }

  public override async getPattern(): Promise<KPattern> {
    const arr: Uint8Array = await decryptPattern(
      new Uint8Array(await this.readFaceletStatus1Characteristic()),
      this.aesKey,
    );
    const stickers: number[] = [];
    for (let i = 0; i < 18; i += 3) {
      let v = (((arr[i ^ 1] << 8) + arr[(i + 1) ^ 1]) << 8) + arr[(i + 2) ^ 1];
      for (let j = 0; j < 8; j++) {
        stickers.push(v & 7);
        v >>= 3;
      }
    }

    return new KPattern(
      this.kpuzzle,
      getPatternData(
        stickers,
        faceOrder,
        gan356iEdgeMappings,
        gan356iCornerMappings,
      ),
    );
  }

  public async faceletStatus1Characteristic(): Promise<BluetoothRemoteGATTCharacteristic> {
    this.cachedFaceletStatus1Characteristic =
      this.cachedFaceletStatus1Characteristic ||
      this.service.getCharacteristic(UUIDs.faceletStatus1Characteristic);
    return this.cachedFaceletStatus1Characteristic;
  }

  public async faceletStatus2Characteristic(): Promise<BluetoothRemoteGATTCharacteristic> {
    this.cachedFaceletStatus2Characteristic =
      this.cachedFaceletStatus2Characteristic ||
      this.service.getCharacteristic(UUIDs.faceletStatus2Characteristic);
    return this.cachedFaceletStatus2Characteristic;
  }

  public async actualAngleAndBatteryCharacteristic(): Promise<BluetoothRemoteGATTCharacteristic> {
    this.cachedActualAngleAndBatteryCharacteristic =
      this.cachedActualAngleAndBatteryCharacteristic ||
      this.service.getCharacteristic(UUIDs.actualAngleAndBatteryCharacteristic);
    return this.cachedActualAngleAndBatteryCharacteristic;
  }

  public async reset(): Promise<void> {
    const faceletStatus1Characteristic =
      await this.faceletStatus1Characteristic();
    await faceletStatus1Characteristic.writeValue(commands["reset"]);
  }

  public async readFaceletStatus1Characteristic(): Promise<ArrayBufferLike> {
    const faceletStatus1Characteristic =
      await this.faceletStatus1Characteristic();
    return (await faceletStatus1Characteristic.readValue()).buffer;
  }

  public async readFaceletStatus2Characteristic(): Promise<string> {
    const faceletStatus2Characteristic =
      await this.faceletStatus2Characteristic();
    return buf2hex((await faceletStatus2Characteristic.readValue()).buffer);
  }

  public async readActualAngleAndBatteryCharacteristic(): Promise<ArrayBufferLike> {
    const actualAngleAndBatteryCharacteristic =
      await this.actualAngleAndBatteryCharacteristic();
    return (await actualAngleAndBatteryCharacteristic.readValue()).buffer;
  }
  // TODO
  // private onphysicalStateCharacteristicChanged(event: any): void {
  //   var val = event.target.value;
  //   debugLog(val);
  // }
}

// // TODO: Move this into a factory?
export const ganConfig: BluetoothConfig<BluetoothPuzzle> = {
  connect: GanCube.connect.bind(GanCube),
  prefixes: ["GAN"],
  filters: [{ namePrefix: "GAN" }],
  optionalServices: [UUIDs.ganCubeService, UUIDs.infoService],
};
