import {BlockMove} from "../alg/index"
import {Transformation} from "../kpuzzle/index"

/******** BluetoothPuzzle ********/

// TODO: Make compatible with Twisty.
export type PuzzleState = Transformation

// TODO: Use actual `CustomEvent`s?
// https://developer.mozilla.org/en-US/docs/Web/API/CustomEvent
export class MoveEvent {
  latestMove: BlockMove;
  timeStamp: number;
  debug?: Object;
  state?: PuzzleState
  quaternion?: any
}

export type BluetoothConfig = {
  filters: BluetoothRequestDeviceFilter[];
  optionalServices: BluetoothServiceUUID[];
};

// TODO: Expose device name (and/or globally unique identifier)?
export abstract class BluetoothPuzzle {
  protected listeners: ((e: MoveEvent) => void)[] = []; // TODO: type

  public abstract name(): string | undefined;

  // TODO: require subclasses to implement this?
  public async getState(): Promise<PuzzleState> {
    throw "cannot get state";
  }

  public addMoveListener(listener: (e: MoveEvent) => void): void {
    this.listeners.push(listener);
  }

  protected dispatchMove(moveEvent: MoveEvent): void {
    for (var l of this.listeners) {
      l(moveEvent);
    }
  }
}
