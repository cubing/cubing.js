// From api.twizzle.net

// TODO: Reuse https://github.com/cubing/cubing.js/blob/ec71ca736f29bae8ed6104f887a5cbe5fc962e8c/src/cubing/bluetooth/bluetooth-puzzle.ts#L12-L18
export interface MoveEvent {
  // deno-lint-ignore no-explicit-any
  latestMove: any;
  timeStamp: number;
  // deno-lint-ignore no-explicit-any
  state: any; // string // TODO: rename to `pattern`
}

export interface BinaryMoveEvent {
  // deno-lint-ignore no-explicit-any
  latestMove: any;
  timeStamp: number;
  binaryState: string; // string
}

// TODO: Reuse https://github.com/cubing/cubing.js/blob/ec71ca736f29bae8ed6104f887a5cbe5fc962e8c/src/cubing/bluetooth/bluetooth-puzzle.ts#L21:L30
export interface OrientationEvent {
  quaternion: {
    x: number;
    y: number;
    z: number;
    w: number;
  };
  timeStamp: number;
  // debug?: Record<string, unknown>;
}

// TODO: Reuse https://github.com/cubing/cubing.js/blob/ec71ca736f29bae8ed6104f887a5cbe5fc962e8c/src/cubing/bluetooth/bluetooth-puzzle.ts#L21:L30
export interface ResetEvent {
  trackingOrientation: boolean;
}

export type StreamMessageEvent =
  | { event: "move"; data: MoveEvent }
  | {
      event: "orientation";
      data: OrientationEvent;
    }
  | {
      event: "reset";
      data: ResetEvent;
    };
