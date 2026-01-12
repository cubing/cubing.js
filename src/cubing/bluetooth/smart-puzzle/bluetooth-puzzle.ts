import type { KPattern } from "../../kpuzzle/KPattern";
import type {
  ExperimentalAlgLeafEvent,
  ExperimentalOrientationEvent,
} from "../../stream";
import {
  BasicRotationTransformer,
  type StreamTransformer,
} from "../transformer";

/******** BluetoothPuzzle ********/

export interface BluetoothConfig<T> {
  connect:
    | ((
        server: BluetoothRemoteGATTServer,
        device: BluetoothDevice,
      ) => Promise<T>)
    | ((
        server: BluetoothRemoteGATTServer,
        device?: BluetoothDevice,
      ) => Promise<T>);
  // TODO: Can we reuse `filters`?
  prefixes: string[]; // `[""]` for GiiKER
  filters: BluetoothLEScanFilter[];
  optionalServices: BluetoothServiceUUID[];
}

// TODO: Expose device name (and/or globally unique identifier)?

/** @category Smart Puzzles */
export abstract class BluetoothPuzzle extends EventTarget {
  public transformers: StreamTransformer[] = [];
  protected listeners: Array<(e: ExperimentalAlgLeafEvent) => void> = []; // TODO: type
  protected orientationListeners: Array<
    (e: ExperimentalOrientationEvent) => void
  > = []; // TODO: type

  public abstract name(): string | undefined;
  public abstract disconnect(): void; // TODO: Can we make this reutrn (async) on success?

  // TODO: require subclasses to implement this?
  public async getPattern(): Promise<KPattern> {
    throw new Error("cannot get pattern");
  }

  public addAlgLeafListener(
    listener: (e: ExperimentalAlgLeafEvent) => void,
  ): void {
    this.listeners.push(listener);
  }

  public addOrientationListener(
    listener: (e: ExperimentalOrientationEvent) => void,
  ): void {
    this.orientationListeners.push(listener);
  }

  public experimentalAddBasicRotationTransformer(): void {
    this.transformers.push(new BasicRotationTransformer());
  }

  protected dispatchAlgLeaf(algLeaf: ExperimentalAlgLeafEvent): void {
    for (const transformer of this.transformers) {
      transformer.transformAlgLeaf(algLeaf);
    }
    for (const l of this.listeners) {
      l(algLeaf);
    }
  }

  protected dispatchOrientation(
    orientationEvent: ExperimentalOrientationEvent,
  ): void {
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
