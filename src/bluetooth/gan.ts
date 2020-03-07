/* tslint:disable no-bitwise */

import { Quaternion } from "three";
import { BareBlockMove, BlockMove } from "../alg";
import { KPuzzle, Puzzles } from "../kpuzzle";
import { BluetoothConfig, BluetoothPuzzle, PuzzleState } from "./bluetooth-puzzle";
import { debugLog } from "./debug";
import { importKey, unsafeDecryptBlock } from "./unsafe-raw-aes";

// This needs to be short enough to capture 6 moves (OBQTM).
const DEFAULT_INTERVAL_MS = 150;
// Number of latest moves provided by the Gan 356i.
const MAX_LATEST_MOVES = 6;

const ganMoveToBlockMove: { [i: number]: BlockMove } = {
  0x00: BareBlockMove("U"),
  0x02: BareBlockMove("U", -1),
  0x03: BareBlockMove("R"),
  0x05: BareBlockMove("R", -1),
  0x06: BareBlockMove("F"),
  0x08: BareBlockMove("F", -1),
  0x09: BareBlockMove("D"),
  0x0b: BareBlockMove("D", -1),
  0x0c: BareBlockMove("L"),
  0x0e: BareBlockMove("L", -1),
  0x0f: BareBlockMove("B"),
  0x11: BareBlockMove("B", -1),
};

let homeQuatInverse: Quaternion | null = null;

function probablyDecodedCorrectly(data: Uint8Array): boolean {
  return data[13] < 0x12 && data[14] < 0x12 && data[15] < 0x12 && data[16] < 0x12 && data[17] < 0x12 && data[18] < 0x12;
}

const key10 = new Uint8Array([198, 202, 21, 223, 79, 110, 19, 182, 119, 13, 230, 89, 58, 175, 186, 162]);
const key11 = new Uint8Array([67, 226, 91, 214, 125, 220, 120, 216, 7, 96, 163, 218, 130, 60, 1, 241]);

// Clean-room reverse-engineered
async function decryptState(data: Uint8Array, key: Uint8Array, macAddress: Uint8Array): Promise<Uint8Array> {
  // TODO: Read from puzzle.
  const keyBuffer = new Uint8Array(key10);
  for (let i = 0; i < macAddress.length; i++) {
    keyBuffer[i] = (keyBuffer[i] + macAddress[i]) % 256;
  }

  const aesKey = await importKey(new Uint8Array(keyBuffer));
  data.set(new Uint8Array(await unsafeDecryptBlock(aesKey, data.slice(3))), 3);
  data.set(new Uint8Array(await unsafeDecryptBlock(aesKey, data.slice(0, 16))), 0);
  return data;
}

// TODO: Support caching which decoding strategy worked last time.
async function decodeState(data: Uint8Array, macAddress: Uint8Array): Promise<Uint8Array> {
  if (probablyDecodedCorrectly(data)) {
    return data;
  }
  const decrypted10 = await decryptState(data, key10, macAddress);
  if (probablyDecodedCorrectly(decrypted10)) {
    return decrypted10;
  }
  const decrypted11 = await decryptState(data, key11, macAddress);
  if (probablyDecodedCorrectly(decrypted11)) {
    return decrypted11;
  }
  throw new Error("Unable to decode");
}

class PhysicalState {

  public static async read(characteristic: BluetoothRemoteGATTCharacteristic, macAddress: Uint8Array): Promise<PhysicalState> {
    const value = await decodeState(new Uint8Array((await characteristic.readValue()).buffer), macAddress);
    const timeStamp = Date.now();
    return new PhysicalState(new DataView(value.buffer), timeStamp);
  }
  private arr: Uint8Array;
  private arrLen = 19;
  private constructor(private dataView: DataView, public timeStamp: number) {
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
      homeQuatInverse = quat.clone().inverse();
    }

    return quat.clone().multiply(homeQuatInverse!.clone());
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
  public latestMoves(n: number): BlockMove[] {
    if (n < 0 || n > MAX_LATEST_MOVES) {
      throw new Error(`Must ask for 0 to 6 latest moves. (Asked for ${n})`);
    }
    return Array.from(this.arr.slice(19 - n, 19)).map((i) => ganMoveToBlockMove[i]);
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
};

const commands: { [cmd: string]: BufferSource } = {
  reset: new Uint8Array([0x00, 0x00, 0x24, 0x00, 0x49, 0x92, 0x24, 0x49, 0x6d, 0x92, 0xdb, 0xb6, 0x49, 0x92, 0xb6, 0x24, 0x6d, 0xdb]),
};

// // TODO: Move this into a factory?
export const ganConfig: BluetoothConfig = {
  filters: [
    { namePrefix: "GAN" },
  ],
  optionalServices: [
    UUIDs.ganCubeService,
  ],
};

function buf2hex(buffer: ArrayBuffer): string { // buffer is an ArrayBuffer
  return Array.prototype.map.call(new Uint8Array(buffer), (x: number) => ("00" + x.toString(16)).slice(-2)).join(" ");
}

const reidEdgeOrder = "UF UR UB UL DF DR DB DL FR FL BR BL".split(" ");
const reidCornerOrder = "UFR URB UBL ULF DRF DFL DLB DBR".split(" ");

interface PieceInfo {
  piece: number;
  orientation: number;
}

function rotateLeft(s: string, i: number): string {
  return s.slice(i) + s.slice(0, i);
}

const pieceMap: { [s: string]: PieceInfo } = {};
// TODO: Condense the for loops.
reidEdgeOrder.forEach((edge, idx) => {
  for (let i = 0; i < 2; i++) {
    pieceMap[rotateLeft(edge, i)] = { piece: idx, orientation: i };
  }
});
reidCornerOrder.forEach((corner, idx) => {
  for (let i = 0; i < 3; i++) {
    pieceMap[rotateLeft(corner, i)] = { piece: idx, orientation: i };
  }
});

const gan356iCornerMappings = [
  [0, 21, 15], [5, 13, 47], [7, 45, 39], [2, 37, 23],
  [29, 10, 16], [31, 18, 32], [26, 34, 40], [24, 42, 8],
];

const gan356iEdgeMappings = [
  [1, 22], [3, 14], [6, 46], [4, 38],
  [30, 17], [27, 9], [25, 41], [28, 33],
  [19, 12], [20, 35], [44, 11], [43, 36],
];
const faceOrder = "URFDLB";

// TODO
// class CharacteristicGetter {
//   characteristics: {[s: string]: Promise<BluetoothRemoteGATTCharacteristic> | null}
//   constructor(private service: BluetoothRemoteGATTService) {
//   }

//   // get()
// }

function getMacAddress(name: string): Uint8Array {
  const macAddress = new Uint8Array([0x4c, 0x24, 0x98, 0x00, 0x00, 0x00]);
  if (name.length !== 10 || !name.startsWith("GAN-")) {
    console.warn("Unexpected puzzle name.");
  }
  macAddress[3] = parseInt(name.slice(4, 6), 16);
  macAddress[4] = parseInt(name.slice(6, 8), 16);
  macAddress[5] = parseInt(name.slice(8, 10), 16);
  return macAddress;
}

export class GanCube extends BluetoothPuzzle {
  // We have to perform async operations before we call the constructor.
  public static async connect(server: BluetoothRemoteGATTServer): Promise<GanCube> {
    const macAddress = getMacAddress(server.device!.name!);

    const ganCubeService = await server.getPrimaryService(UUIDs.ganCubeService);
    debugLog("Service:", ganCubeService);

    const physicalStateCharacteristic = await ganCubeService.getCharacteristic(UUIDs.physicalStateCharacteristic);
    debugLog("Characteristic:", physicalStateCharacteristic);

    const initialMoveCounter = (await PhysicalState.read(physicalStateCharacteristic, macAddress)).moveCounter();
    debugLog("Initial Move Counter:", initialMoveCounter);
    const cube = new GanCube(ganCubeService, server, physicalStateCharacteristic, initialMoveCounter, macAddress);
    return cube;
  }

  public INTERVAL_MS: number = DEFAULT_INTERVAL_MS;
  private intervalHandle: number | null = null;
  private kpuzzle: KPuzzle = new KPuzzle(Puzzles["3x3x3"]);
  private cachedFaceletStatus1Characteristic: Promise<BluetoothRemoteGATTCharacteristic>;
  private cachedFaceletStatus2Characteristic: Promise<BluetoothRemoteGATTCharacteristic>;
  private cachedActualAngleAndBatteryCharacteristic: Promise<BluetoothRemoteGATTCharacteristic>;
  private constructor(private service: BluetoothRemoteGATTService, private server: BluetoothRemoteGATTServer, private physicalStateCharacteristic: BluetoothRemoteGATTCharacteristic, private lastMoveCounter: number, private macAddress: Uint8Array) {
    super();
    this.startTrackingMoves();
  }

  public name(): string | undefined {
    return this.server.device.name;
  }

  public startTrackingMoves(): void {
    // `window.setInterval` instead of `setInterval`:
    // https://github.com/Microsoft/TypeScript/issues/842#issuecomment-252445883
    this.intervalHandle = window.setInterval(this.intervalHandler.bind(this), this.INTERVAL_MS);
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
    const physicalState = await PhysicalState.read(this.physicalStateCharacteristic, this.macAddress);
    let numInterveningMoves = physicalState.numMovesSince(this.lastMoveCounter);
    // console.log(numInterveningMoves);
    if (numInterveningMoves > MAX_LATEST_MOVES) {
      debugLog(`Too many moves! Dropping ${numInterveningMoves - MAX_LATEST_MOVES} moves`);
      numInterveningMoves = MAX_LATEST_MOVES;
    }
    for (const move of physicalState.latestMoves(numInterveningMoves)) {
      // console.log(move);
      this.kpuzzle.applyBlockMove(move);
      this.dispatchMove({
        latestMove: move,
        timeStamp: physicalState.timeStamp,
        debug: physicalState.debugInfo(),
        state: this.kpuzzle.state,
        // quaternion: physicalState.rotQuat(),
      });
    }
    const { x, y, z, w } = physicalState.rotQuat();
    this.dispatchOrientation({
      timeStamp: physicalState.timeStamp,
      quaternion: { x, y, z, w },
    });
    this.lastMoveCounter = physicalState.moveCounter();
  }

  public async getBattery(): Promise<number> {
    return new Uint8Array(await this.readActualAngleAndBatteryCharacteristic())[7];
  }

  public async getState(): Promise<PuzzleState> {
    const arr: Uint8Array = await decodeState(new Uint8Array((await this.readFaceletStatus1Characteristic())), this.macAddress);
    const stickers: number[] = [];
    for (let i = 0; i < 18; i += 3) {
      let v = (((arr[i ^ 1] << 8) + arr[(i + 1) ^ 1]) << 8) + arr[(i + 2) ^ 1];
      for (let j = 0; j < 8; j++) {
        stickers.push(v & 7);
        v >>= 3;
      }
    }

    const state: PuzzleState = {
      CORNER: {
        permutation: [],
        orientation: [],
      },
      EDGE: {
        permutation: [],
        orientation: [],
      },
      CENTER: {
        permutation: [0, 1, 2, 3, 4, 5],
        orientation: [0, 0, 0, 0, 0, 0],
      },
    };

    for (const cornerMapping of gan356iCornerMappings) {
      const pieceInfo: PieceInfo = pieceMap[cornerMapping.map((i) => faceOrder[stickers[i]]).join("")];
      state.CORNER.permutation.push(pieceInfo.piece);
      state.CORNER.orientation.push(pieceInfo.orientation);
    }

    for (const edgeMapping of gan356iEdgeMappings) {
      const pieceInfo: PieceInfo = pieceMap[edgeMapping.map((i) => faceOrder[stickers[i]]).join("")];
      state.EDGE.permutation.push(pieceInfo.piece);
      state.EDGE.orientation.push(pieceInfo.orientation);
    }

    return state;
  }

  public async faceletStatus1Characteristic(): Promise<BluetoothRemoteGATTCharacteristic> {
    this.cachedFaceletStatus1Characteristic = this.cachedFaceletStatus1Characteristic || this.service.getCharacteristic(UUIDs.faceletStatus1Characteristic);
    return this.cachedFaceletStatus1Characteristic;
  }

  public async faceletStatus2Characteristic(): Promise<BluetoothRemoteGATTCharacteristic> {
    this.cachedFaceletStatus2Characteristic = this.cachedFaceletStatus2Characteristic || this.service.getCharacteristic(UUIDs.faceletStatus2Characteristic);
    return this.cachedFaceletStatus2Characteristic;
  }

  public async actualAngleAndBatteryCharacteristic(): Promise<BluetoothRemoteGATTCharacteristic> {
    this.cachedActualAngleAndBatteryCharacteristic = this.cachedActualAngleAndBatteryCharacteristic || this.service.getCharacteristic(UUIDs.actualAngleAndBatteryCharacteristic);
    return this.cachedActualAngleAndBatteryCharacteristic;
  }

  public async reset(): Promise<void> {
    const faceletStatus1Characteristic = await this.faceletStatus1Characteristic();
    await faceletStatus1Characteristic.writeValue(commands.reset);
  }

  public async readFaceletStatus1Characteristic(): Promise<ArrayBuffer> {
    const faceletStatus1Characteristic = await this.faceletStatus1Characteristic();
    return (await faceletStatus1Characteristic.readValue()).buffer;
  }

  public async readFaceletStatus2Characteristic(): Promise<string> {
    const faceletStatus2Characteristic = await this.faceletStatus2Characteristic();
    return buf2hex((await faceletStatus2Characteristic.readValue()).buffer);
  }

  public async readActualAngleAndBatteryCharacteristic(): Promise<ArrayBuffer> {
    const actualAngleAndBatteryCharacteristic = await this.actualAngleAndBatteryCharacteristic();
    return (await actualAngleAndBatteryCharacteristic.readValue()).buffer;
  }

  // TODO
  // private onphysicalStateCharacteristicChanged(event: any): void {
  //   var val = event.target.value;
  //   debugLog(val);
  // }
}
