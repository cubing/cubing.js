import type { PuzzlePosition } from "../../../animation/cursor/CursorTypes";
import type { IndexerProp } from "../depth-3/IndexerProp";
import type { TimelineProp } from "../depth-4/TimelineProp";
import { ManagedSource } from "../ManagedSource";
import { TwistyProp } from "../TwistyProp";

export class PositionProp extends TwistyProp {
  #indexerProp: ManagedSource<IndexerProp>;
  #timelineProp: ManagedSource<TimelineProp>;

  constructor(indexerProp: IndexerProp, timelineProp: TimelineProp) {
    super();
    this.#indexerProp = new ManagedSource(
      indexerProp,
      this.onIndexerUpdate.bind(this),
    );
    this.#timelineProp = new ManagedSource(
      timelineProp,
      this.onTimelineUpdate.bind(this),
    );
  }

  async onIndexerUpdate(): Promise<void> {
    this.#cachedPosition = null;
    this.dispatch();
  }

  async onTimelineUpdate(): Promise<void> {
    this.#cachedPosition = null;
    this.dispatch();
  }

  #cachedPosition: Promise<PuzzlePosition> | null = null;
  async position(): Promise<PuzzlePosition> {
    console.log("aaaa", this.#timelineProp.target.getTimestamp);
    const [indexer, startState, timestamp] = await Promise.all([
      this.#indexerProp.target.indexer(),
      this.#indexerProp.target.startState(),
      this.#timelineProp.target.getTimestamp(),
    ]);

    return (this.#cachedPosition ??= (async () => {
      const idx = indexer.timestampToIndex(timestamp);
      const position: PuzzlePosition = {
        state: indexer.stateAtIndex(idx, startState) as any, // TODO: types.
        movesInProgress: [],
      };
      return position;
    })());
  }
}
