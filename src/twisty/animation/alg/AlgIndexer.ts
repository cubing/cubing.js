import { Sequence } from "../../../alg";
import { MillisecondTimestamp } from "../Timeline";
import { PuzzlePosition } from "./AlgCursor";
export class AlgIndexer {
  // TODO: figure out whether to place timestamps in algs, or create an interface to wrap algs and move streams.
  // eslint-disable-next-line @typescript-eslint/no-unused-vars-experimental
  constructor(alg: Sequence) {
    /*...*/
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars-experimental
  getPosition(timestamp: MillisecondTimestamp): PuzzlePosition {
    /*...*/
    return [{}, [{} as any]]; // TODO
  }
}
