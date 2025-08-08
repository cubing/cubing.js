/* tslint:disable no-bitwise */

import { Move } from "../../alg";
import type { KPuzzle } from "../../kpuzzle";
import type { KPattern } from "../../kpuzzle/KPattern";
import {
  experimentalBinaryComponentsToReid3x3x3,
  experimentalTwizzleBinaryToBinaryComponents,
} from "../../protocol";
import { puzzles } from "../../puzzles";
import { debugLog } from "../debug";
import {
  type BluetoothConfig,
  BluetoothPuzzle,
  type ConnectionArguments,
} from "./bluetooth-puzzle";
import { flipBitOrder } from "./endianness";

// TODO: Short IDs
const UUIDs = {
  heykubeService: "b46a791a-8273-4fc1-9e67-94d3dc2aac1c",
  stateCharacteristic: "a2f41a4e-0e31-4bbc-9389-4253475481fb",
  batteryCharacteristic: "fd51b3ba-99c7-49c6-9f85-5644ff56a378",
};

/** @category Smart Puzzles */
export class HeykubeCube extends BluetoothPuzzle {
  // We have to perform async operations before we call the constructor.
  public static async connect({
    server,
    device,
  }: ConnectionArguments): Promise<HeykubeCube> {
    const service = await server.getPrimaryService(UUIDs.heykubeService);
    debugLog("Service:", service);

    const stateCharacteristic = await service.getCharacteristic(
      UUIDs.stateCharacteristic,
    );
    debugLog("Characteristic:", stateCharacteristic);

    const cube = new HeykubeCube(
      await puzzles["3x3x3"].kpuzzle(),
      service,
      device,
      server,
      stateCharacteristic,
    );
    return cube;
  }

  private constructor(
    _kpuzzle: KPuzzle,
    _service: BluetoothRemoteGATTService,
    device: BluetoothDevice,
    private server: BluetoothRemoteGATTServer,
    private stateCharacteristic: BluetoothRemoteGATTCharacteristic,
  ) {
    super();

    device.addEventListener(
      "gattserverdisconnected",
      this.onDisconnect.bind(this),
    );

    this.stateCharacteristic.startNotifications();
    this.startTrackingMoves();
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

  public startTrackingMoves(): void {
    this.stateCharacteristic.addEventListener(
      "characteristicvaluechanged",
      (e: any) => this.onStateCharacteristic(e),
    ); // TODO
  }

  // public stopTrackingMoves(): void {}

  // public async getBattery(): Promise<number> {
  //   return new Uint8Array(
  //     await this.readActualAngleAndBatteryCharacteristic(),
  //   )[7];
  // }srcElement: BluetoothRemoteGATTCharacteristic

  private onStateCharacteristic(event: {
    target: BluetoothRemoteGATTCharacteristic;
    timeStamp: number;
  }): void {
    const state = this.decodeState(event.target.value!);
    // console.log(event, state.latestMove.toString(), state);
    this.dispatchAlgLeaf({
      latestAlgLeaf: state.latestMove,
      timeStamp: event.timeStamp,
      pattern: state.pattern,
    });
  }

  private decodeState(dv: DataView): { pattern: KPattern; latestMove: Move } {
    const moves = [
      new Move("U"),
      new Move("U'"),
      new Move("B"),
      new Move("B'"),
      new Move("F"),
      new Move("F'"),
      null,
      null,
      new Move("L"),
      new Move("L'"),
      new Move("D"),
      new Move("D'"),
      new Move("R"),
      new Move("R'"),
      // null,
      // null,
    ];

    const b2 = new Uint8Array(dv.byteLength);
    for (let i = 0; i < dv.byteLength; i++) {
      b2[i] = flipBitOrder(dv.getUint8(i), 8);
    }
    const components1 = experimentalTwizzleBinaryToBinaryComponents(
      b2.slice(0, 11),
    );
    // console.log("sliced", dv.byteLength, bufferToSpacedHex(b2.slice(11)));
    const components2 = {
      epLex: flipBitOrder(components1.epLex, 29),
      eoMask: flipBitOrder(components1.eoMask, 12),
      cpLex: flipBitOrder(components1.cpLex, 16),
      coMask: flipBitOrder(components1.coMask, 13),
      poIdxL: 0,
      poIdxU: 0b111,
      moSupport: 0b1, // TODO
      moMask: 0,
    };
    // console.log(components2, binaryComponentsToReid3x3x3(components2));

    return {
      pattern: experimentalBinaryComponentsToReid3x3x3(components2),
      latestMove: moves[b2[20] & 0b00001111]!,
    };
  }

  public override async getPattern(): Promise<KPattern> {
    const b1 = await this.stateCharacteristic.readValue();
    return this.decodeState(b1).pattern;
  }
}

// // TODO: Move this into a factory?
export const heykubeConfig: BluetoothConfig<BluetoothPuzzle> = {
  connect: HeykubeCube.connect.bind(HeykubeCube),
  prefixes: ["HEYKUBE"],
  filters: [{ namePrefix: "HEYKUBE" }],
  optionalServices: [UUIDs.heykubeService],
};
