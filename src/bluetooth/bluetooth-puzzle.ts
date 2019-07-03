import {BlockMove} from "../alg/index";
import {Transformation} from "../kpuzzle/index";

/******** BluetoothPuzzle ********/

// TODO: Make compatible with Twisty.
export type PuzzleState = Transformation;

// TODO: Use actual `CustomEvent`s?
// https://developer.mozilla.org/en-US/docs/Web/API/CustomEvent
export class MoveEvent {
  public latestMove: BlockMove;
  public timeStamp: number;
  public debug?: object;
  public state?: PuzzleState;
  public quaternion?: any;
}

export interface BluetoothConfig {
  filters: BluetoothRequestDeviceFilter[];
  optionalServices: BluetoothServiceUUID[];
}

// TODO: Expose device name (and/or globally unique identifier)?
export abstract class BluetoothPuzzle {
  protected listeners: Array<(e: MoveEvent) => void> = []; // TODO: type

  public abstract name(): string | undefined;

  // TODO: require subclasses to implement this?
  public async getState(): Promise<PuzzleState> {
    throw new Error("cannot get state");
  }

  public addMoveListener(listener: (e: MoveEvent) => void): void {
    this.listeners.push(listener);
  }

  protected dispatchMove(moveEvent: MoveEvent): void {
    for (const l of this.listeners) {
      l(moveEvent);
    }
  }
}
