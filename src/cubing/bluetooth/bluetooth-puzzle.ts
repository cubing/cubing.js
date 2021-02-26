import { Turn } from "../alg";
import { Transformation } from "../kpuzzle";
import { BasicRotationTransformer, StreamTransformer } from "./transformer";

/******** BluetoothPuzzle ********/

// TODO: Make compatible with Twisty.
export type PuzzleState = Transformation;

// TODO: Use actual `CustomEvent`s?
// https://developer.mozilla.org/en-US/docs/Web/API/CustomEvent
export interface TurnEvent {
  latestTurn: Turn;
  timeStamp: number;
  debug?: Record<string, unknown>;
  state?: PuzzleState;
  quaternion?: any; // TODO: Unused
}

// TODO: Only use the `quaternion` field in the `TurnEvent`?
export interface OrientationEvent {
  quaternion: {
    x: number;
    y: number;
    z: number;
    w: number;
  };
  timeStamp: number;
  debug?: Record<string, unknown>;
}

export interface BluetoothConfig {
  filters: BluetoothRequestDeviceFilter[];
  optionalServices: BluetoothServiceUUID[];
}

// TODO: Expose device name (and/or globally unique identifier)?
export abstract class BluetoothPuzzle {
  public transformers: StreamTransformer[] = [];
  protected listeners: Array<(e: TurnEvent) => void> = []; // TODO: type
  protected orientationListeners: Array<(e: OrientationEvent) => void> = []; // TODO: type

  public abstract name(): string | undefined;

  // TODO: require subclasses to implement this?
  public async getState(): Promise<PuzzleState> {
    throw new Error("cannot get state");
  }

  public addTurnListener(listener: (e: TurnEvent) => void): void {
    this.listeners.push(listener);
  }

  public addOrientationListener(listener: (e: OrientationEvent) => void): void {
    this.orientationListeners.push(listener);
  }

  public experimentalAddBasicRotationTransformer(): void {
    this.transformers.push(new BasicRotationTransformer());
  }

  protected dispatchTurn(turnEvent: TurnEvent): void {
    for (const transformer of this.transformers) {
      transformer.transformTurn(turnEvent);
    }
    for (const l of this.listeners) {
      l(turnEvent);
    }
  }

  protected dispatchOrientation(orientationEvent: OrientationEvent): void {
    for (const transformer of this.transformers) {
      transformer.transformOrientation(orientationEvent);
    }
    const { x, y, z, w } = orientationEvent.quaternion;
    // TODO: can we avoid mutating the source event?
    orientationEvent.quaternion = {
      x,
      y,
      z,
      w,
    };
    for (const l of this.orientationListeners) {
      // TODO: Convert quaternion.
      l(orientationEvent);
    }
  }
}
