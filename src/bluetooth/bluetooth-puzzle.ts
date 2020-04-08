import { BlockMove } from "../alg";
import { Transformation } from "../kpuzzle";
import { BasicRotationTransformer, StreamTransformer } from "./transformer";

/******** BluetoothPuzzle ********/

// TODO: Make compatible with Twisty.
export type PuzzleState = Transformation;

// TODO: Use actual `CustomEvent`s?
// https://developer.mozilla.org/en-US/docs/Web/API/CustomEvent
export interface MoveEvent {
  latestMove: BlockMove;
  timeStamp: number;
  debug?: object;
  state?: PuzzleState;
  quaternion?: any; // TODO: Unused
}

// TODO: Only use the `quaternion` field in the `MoveEvent`?
export interface OrientationEvent {
  quaternion: { x: number, y: number, z: number, w: number };
  timeStamp: number;
  debug?: object;
}

export interface BluetoothConfig {
  filters: BluetoothRequestDeviceFilter[];
  optionalServices: BluetoothServiceUUID[];
}

// TODO: Expose device name (and/or globally unique identifier)?
export abstract class BluetoothPuzzle {
  public transformers: StreamTransformer[] = [];
  protected listeners: Array<(e: MoveEvent) => void> = []; // TODO: type
  protected orientationListeners: Array<(e: OrientationEvent) => void> = []; // TODO: type

  public abstract name(): string | undefined;

  // TODO: require subclasses to implement this?
  public async getState(): Promise<PuzzleState> {
    throw new Error("cannot get state");
  }

  public addMoveListener(listener: (e: MoveEvent) => void): void {
    this.listeners.push(listener);
  }

  public addOrientationListener(listener: (e: OrientationEvent) => void): void {
    this.orientationListeners.push(listener);
  }

  public experimentalAddBasicRotationTransformer(): void {
    this.transformers.push(new BasicRotationTransformer());
  }

  protected dispatchMove(moveEvent: MoveEvent): void {
    for (const transformer of this.transformers) {
      transformer.transformMove(moveEvent);
    }
    for (const l of this.listeners) {
      l(moveEvent);
    }
  }

  protected dispatchOrientation(orientationEvent: OrientationEvent): void {
    for (const transformer of this.transformers) {
      transformer.transformOrientation(orientationEvent);
    }
    for (const l of this.orientationListeners) {
      // TODO: Convert quaternion.
      l(orientationEvent);
    }
  }

}
