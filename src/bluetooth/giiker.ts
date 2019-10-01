/* tslint:disable no-bitwise */

import {BareBlockMove, BlockMove} from "../alg";
import {Transformation} from "../kpuzzle";

import {BluetoothConfig, BluetoothPuzzle, PuzzleState} from "./bluetooth-puzzle";
import {debugLog} from "./debug";

const UUIDs = {
  cubeService: "0000aadb-0000-1000-8000-00805f9b34fb",
  cubeCharacteristic: "0000aadc-0000-1000-8000-00805f9b34fb",
};

// TODO: Move this into a factory?
export const giiKERConfig: BluetoothConfig = {
  filters: [
    {namePrefix: "GiC"},
    {namePrefix: "GiS"},
    {namePrefix: "GiY"},
    {namePrefix: "Gi2"},
  ],
  optionalServices: [
    // "00001530-1212-efde-1523-785feabcd123",
    // "0000aaaa-0000-1000-8000-00805f9b34fb",
    UUIDs.cubeService,
    // "0000180f-0000-1000-8000-00805f9b34fb",
    // "0000180a-0000-1000-8000-00805f9b34fb"
  ],
};

// TODO: Expose for testing.
function giikerMoveToBlockMove(face: number, amount: number): BlockMove {
  if (amount === 9) {
    debugLog("Encountered 9", face, amount);
    amount = 2;
  }
  amount = [0, 1, 2, -1][amount];

  const family = ["?", "B", "D", "L", "U", "R", "F"][face];
  return BareBlockMove(family, amount);
}

export {giikerMoveToBlockMove as giikerMoveToBlockMoveForTesting};

function giikerStateStr(giikerState: number[]): string {
  let str = "";
  str += giikerState.slice(0, 8).join(".");
  str += "\n";
  str += giikerState.slice(8, 16).join(".");
  str += "\n";
  str += giikerState.slice(16, 28).join(".");
  str += "\n";
  str += giikerState.slice(28, 32).join(".");
  str += "\n";
  str += giikerState.slice(32, 40).join(".");
  return str;
}

// TODO
// const Reid333Orbits = {
//   "EDGE":   {"numPieces": 12, "orientations": 2},
//   "CORNER": {"numPieces": 8,  "orientations": 3},
//   "CENTER": {"numPieces": 6,  "orientations": 4}
// };

const Reid333SolvedCenters = {
  permutation: [0, 1, 2, 3, 4, 5],
  orientation: [0, 0, 0, 0, 0, 0],
};

const epGiiKERtoReid333: number[] = [4, 8, 0, 9, 5, 1, 3, 7, 6, 10, 2, 11];
const epReid333toGiiKER: number[] = [2, 5, 10, 6, 0, 4, 8, 7, 1, 3, 9, 11];

const preEO: number[] = [1, 0, 1, 0, 1, 0, 1, 0, 0, 0, 0, 0];
const postEO: number[] = [1, 0, 1, 0, 1, 0, 1, 0, 0, 0, 0, 0];

const cpGiiKERtoReid333: number[] = [4, 0, 3, 5, 7, 1, 2, 6];
const cpReid333toGiiKER: number[] = [1, 5, 6, 2, 0, 3, 7, 4];

const preCO: number[] = [1, 2, 1, 2, 2, 1, 2, 1];
const postCO: number[] = [2, 1, 2, 1, 1, 2, 1, 2];

const coFlip: number[] = [-1, 1, -1, 1, 1, -1, 1, -1];

export class GiiKERCube extends BluetoothPuzzle {

  public static async connect(server: BluetoothRemoteGATTServer): Promise<GiiKERCube> {

    const cubeService = await server.getPrimaryService(UUIDs.cubeService);
    debugLog("Service:", cubeService);

    const cubeCharacteristic = await cubeService.getCharacteristic(UUIDs.cubeCharacteristic);
    debugLog("Characteristic:", cubeCharacteristic);

    // TODO: Can we safely save the async promise instead of waiting for the response?

    const originalValue = await cubeCharacteristic.readValue();
    debugLog("Original value:", originalValue);
    const cube = new GiiKERCube(server, cubeCharacteristic, originalValue);

    await cubeCharacteristic.startNotifications();
    cubeCharacteristic.addEventListener(
      "characteristicvaluechanged",
      cube.onCubeCharacteristicChanged.bind(cube),
    );

    return cube;
  }
  private constructor(private server: BluetoothRemoteGATTServer, private cubeCharacteristic: BluetoothRemoteGATTCharacteristic, private originalValue?: DataView | null) {
    super();
  }

  public name(): string | undefined {
    return this.server.device.name;
  }

  public async getState(): Promise<PuzzleState> {
    return this.toReid333(await this.cubeCharacteristic.readValue());
  }

  private getNibble(val: DataView, i: number): number {
    if (i % 2 === 1) {
      return val.getUint8((i / 2) | 0) % 16;
    }
    return 0 | (val.getUint8((i / 2) | 0) / 16);
  }

  private getBit(val: DataView, i: number): number {
    const n = ((i / 8) | 0);
    const shift = 7 - (i % 8);
    return (val.getUint8(n) >> shift) & 1;
  }

  private toReid333(val: DataView): Transformation {
    const state = {
      EDGE: {
        permutation: new Array(12),
        orientation: new Array(12),
      },
      CORNER: {
        permutation: new Array(8),
        orientation: new Array(8),
      },
      CENTER: Reid333SolvedCenters,
    };

    for (let i = 0; i < 12; i++) {
      const gi = epReid333toGiiKER[i];
      state.EDGE.permutation[i] = epGiiKERtoReid333[this.getNibble(val, gi + 16) - 1];
      state.EDGE.orientation[i] = this.getBit(val, gi + 112) ^ preEO[state.EDGE.permutation[i]] ^ postEO[i];
    }
    for (let i = 0; i < 8; i++) {
      const gi = cpReid333toGiiKER[i];
      state.CORNER.permutation[i] = cpGiiKERtoReid333[this.getNibble(val, gi) - 1];
      state.CORNER.orientation[i] = (this.getNibble(val, gi + 8) * coFlip[gi] + preCO[state.CORNER.permutation[i]] + postCO[i]) % 3;
    }
    return state;
  }

  private onCubeCharacteristicChanged(event: any): void {
    const val = event.target.value;
    debugLog(val);

    if (this.isRepeatedInitialValue(val)) {
        debugLog("Skipping repeated initial value.");
        return;
    }

    const giikerState = [];
    for (let i = 0; i < 20; i++) {
      giikerState.push(Math.floor(val.getUint8(i) / 16));
      giikerState.push(val.getUint8(i) % 16);
    }
    const str = giikerStateStr(giikerState);
    debugLog(str);

    this.dispatchMove({
      latestMove: giikerMoveToBlockMove(giikerState[32], giikerState[33]),
      timeStamp: event.timeStamp,
      debug: {
        stateStr: str,
      },
      state: this.toReid333(val),
    });
  }

  private isRepeatedInitialValue(val: DataView): boolean {
    if (typeof (this.originalValue) === "undefined") {
      // TODO: Test this branch.
      throw new Error("GiiKERCube has uninitialized original value.");
    }

    if (this.originalValue === null) {
      return false;
    }

    const originalValue = this.originalValue;
    // Reset the value here, so we can return early below.
    this.originalValue = null;

    debugLog("Comparing against original value.");
    for (let i = 0; i < 20; i++) {
      if (originalValue.getUint8(i) !== val.getUint8(i)) {
        debugLog("Different at index ", i);
        return false;
      }
    }
    return true;
  }
}
