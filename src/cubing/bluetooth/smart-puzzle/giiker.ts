/* tslint:disable no-bitwise */

import { Move } from "../../alg";
import { KPattern, type KPatternData } from "../../kpuzzle";
import { experimental3x3x3KPuzzle } from "../../puzzles/cubing-private";
import { debugLog } from "../debug";
import {
  type BluetoothConfig,
  BluetoothPuzzle,
  type ConnectionArguments,
} from "./bluetooth-puzzle";

const MESSAGE_LENGTH = 20;

const UUIDs = {
  cubeService: "0000aadb-0000-1000-8000-00805f9b34fb",
  cubeCharacteristic: "0000aadc-0000-1000-8000-00805f9b34fb",
};

// TODO: Expose for testing.
function giikerMoveToAlgMove(face: number, amount: number): Move {
  switch (amount) {
    case 3: {
      amount = -1;
      break;
    }
    case 9: {
      debugLog("Encountered 9", face, amount);
      amount = -2;
      break;
    }
  }

  const family = ["?", "B", "D", "L", "U", "R", "F"][face];
  return new Move(family, amount);
}

export { giikerMoveToAlgMove as giikerMoveToAlgMoveForTesting };

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
//   "EDGES":   {"numPieces": 12, "orientations": 2},
//   "CORNERS": {"numPieces": 8,  "orientations": 3},
//   "CENTERS": {"numPieces": 6,  "orientations": 4}
// };

const Reid333SolvedCenters = {
  pieces: [0, 1, 2, 3, 4, 5],
  orientation: [0, 0, 0, 0, 0, 0],
  orientationMod: [1, 1, 1, 1, 1, 1], // TODO
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

function getNibble(val: Uint8Array, i: number): number {
  if (i % 2 === 1) {
    return val[(i / 2) | 0] % 16;
  }
  return 0 | (val[(i / 2) | 0] / 16);
}

function probablyEncrypted(data: Uint8Array): boolean {
  return data[18] === 0xa7;
}

const lookup = [
  176, 81, 104, 224, 86, 137, 237, 119, 38, 26, 193, 161, 210, 126, 150, 81, 93,
  13, 236, 249, 89, 235, 88, 24, 113, 81, 214, 131, 130, 199, 2, 169, 39, 165,
  171, 41,
];

function decryptState(data: Uint8Array): Uint8Array {
  const offset1 = getNibble(data, 38);
  const offset2 = getNibble(data, 39);
  const output = new Uint8Array(MESSAGE_LENGTH);
  for (let i = 0; i < MESSAGE_LENGTH; i++) {
    output[i] = data[i] + lookup[offset1 + i] + lookup[offset2 + i];
  }
  return output;
}

// TODO: Support caching which decoding strategy worked last time.
async function decodeState(data: Uint8Array): Promise<Uint8Array> {
  if (!probablyEncrypted(data)) {
    return data;
  }
  return decryptState(data);
  // TODO: Check that the decrypted state is a valid staet.
}

/** @category Smart Puzzles */
export class GiiKERCube extends BluetoothPuzzle {
  public static async connect({
    server,
  }: ConnectionArguments): Promise<GiiKERCube> {
    const cubeService = await server.getPrimaryService(UUIDs.cubeService);
    debugLog("Service:", cubeService);

    const cubeCharacteristic = await cubeService.getCharacteristic(
      UUIDs.cubeCharacteristic,
    );
    debugLog("Characteristic:", cubeCharacteristic);

    // TODO: Can we safely save the async promise instead of waiting for the response?

    const originalValue = await decodeState(
      new Uint8Array((await cubeCharacteristic.readValue()).buffer),
    );
    debugLog("Original value:", originalValue);
    const cube = new GiiKERCube(server, cubeCharacteristic, originalValue);

    await cubeCharacteristic.startNotifications();
    cubeCharacteristic.addEventListener(
      "characteristicvaluechanged",
      cube.onCubeCharacteristicChanged.bind(cube),
    );

    return cube;
  }

  private constructor(
    private server: BluetoothRemoteGATTServer,
    private cubeCharacteristic: BluetoothRemoteGATTCharacteristic,
    private originalValue?: Uint8Array | null,
  ) {
    super();
  }

  public name(): string | undefined {
    return this.server.device.name;
  }

  disconnect(): void {
    this.server.disconnect();
  }

  public override async getPattern(): Promise<KPattern> {
    return this.toReid333(
      new Uint8Array((await this.cubeCharacteristic.readValue()).buffer),
    );
  }

  private getBit(val: Uint8Array, i: number): number {
    const n = (i / 8) | 0;
    const shift = 7 - (i % 8);
    return (val[n] >> shift) & 1;
  }

  private toReid333(val: Uint8Array): KPattern {
    const patternData: KPatternData = {
      EDGES: {
        pieces: new Array(12),
        orientation: new Array(12),
      },
      CORNERS: {
        pieces: new Array(8),
        orientation: new Array(8),
      },
      CENTERS: Reid333SolvedCenters,
    };

    for (let i = 0; i < 12; i++) {
      const gi = epReid333toGiiKER[i];
      patternData["EDGES"].pieces[i] =
        epGiiKERtoReid333[getNibble(val, gi + 16) - 1];
      patternData["EDGES"].orientation[i] =
        this.getBit(val, gi + 112) ^
        preEO[patternData["EDGES"].pieces[i]] ^
        postEO[i];
    }
    for (let i = 0; i < 8; i++) {
      const gi = cpReid333toGiiKER[i];
      patternData["CORNERS"].pieces[i] =
        cpGiiKERtoReid333[getNibble(val, gi) - 1];
      patternData["CORNERS"].orientation[i] =
        (getNibble(val, gi + 8) * coFlip[gi] +
          preCO[patternData["CORNERS"].pieces[i]] +
          postCO[i]) %
        3;
    }
    return new KPattern(experimental3x3x3KPuzzle, patternData);
  }

  private async onCubeCharacteristicChanged(event: any): Promise<void> {
    const val = await decodeState(new Uint8Array(event.target.value.buffer));
    debugLog(val);
    debugLog(val);

    if (this.isRepeatedInitialValue(val)) {
      debugLog("Skipping repeated initial value.");
      return;
    }

    const giikerState = [];
    for (let i = 0; i < MESSAGE_LENGTH; i++) {
      giikerState.push(Math.floor(val[i] / 16));
      giikerState.push(val[i] % 16);
    }
    debugLog(giikerState);
    const str = giikerStateStr(giikerState);
    debugLog(str);

    this.dispatchAlgLeaf({
      latestAlgLeaf: giikerMoveToAlgMove(giikerState[32], giikerState[33]),
      timeStamp: event.timeStamp,
      debug: {
        stateStr: str,
      },
      pattern: this.toReid333(val),
    });
  }

  private isRepeatedInitialValue(val: Uint8Array): boolean {
    if (typeof this.originalValue === "undefined") {
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
    for (let i = 0; i < MESSAGE_LENGTH - 2; i++) {
      if (originalValue[i] !== val[i]) {
        debugLog("Different at index ", i);
        return false;
      }
    }
    return true;
  }
}

// TODO: Move this into a factory?
export const giiKERConfig: BluetoothConfig<BluetoothPuzzle> = {
  connect: GiiKERCube.connect.bind(GiiKERCube),
  prefixes: ["Gi", "", "Mi", "Hi-"], // Hack
  filters: [
    // Known prefixes: GiC, GiS (3x3x3), Gi2 (2x2x2)
    // Suspected prefixes GiY, Gi3
    { namePrefix: "Gi" },
    { namePrefix: "Mi" },
    { namePrefix: "Hi-" },
    { services: ["0000aadb-0000-1000-8000-00805f9b34fb"] },
    { services: ["0000aaaa-0000-1000-8000-00805f9b34fb"] },
    { services: ["0000fe95-0000-1000-8000-00805f9b34fb"] },
  ],
  optionalServices: [
    // "00001530-1212-efde-1523-785feabcd123",
    // "0000aaaa-0000-1000-8000-00805f9b34fb",
    UUIDs.cubeService,
    // "0000180f-0000-1000-8000-00805f9b34fb",
    // "0000180a-0000-1000-8000-00805f9b34fb"
  ],
};
