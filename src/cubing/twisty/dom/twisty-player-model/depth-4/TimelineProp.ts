import type { TimeRange } from "../../../animation/cursor/AlgCursor";
import type { IndexerProp } from "../depth-3/IndexerProp";
import { ManagedSource } from "../ManagedSource";
import { TwistyProp } from "../TwistyProp";

export class TimelineProp extends TwistyProp {
  #indexerProps: ManagedSource<IndexerProp>[];

  constructor(initialIndexerProps: IndexerProp[]) {
    super();
    this.#indexerProps = initialIndexerProps.map(
      (indexerProp) =>
        new ManagedSource(indexerProp, this.onIndexerUpdate.bind(this)),
    );
  }

  async onIndexerUpdate(): Promise<void> {
    this.#cachedTimeRange = null;
    this.dispatch();
  }

  #cachedTimeRange: Promise<TimeRange> | null = null;
  async timeRange(): Promise<TimeRange> {
    return (this.#cachedTimeRange ??= (async () => {
      if (this.#indexerProps.length === 0) {
        console.warn(
          "VisualizationProp.timeRange: No indexer props. This is unexpected.",
        );
        return { start: 0, end: 0 };
      }

      const timeRanges = await Promise.all(
        this.#indexerProps.map((indexerProp) => indexerProp.target.timeRange()),
      );

      let start = timeRanges[0].start;
      let end = timeRanges[0].end;
      for (const timeRange of timeRanges.slice(1)) {
        start = Math.min(timeRange.start, start);
        end = Math.max(timeRange.end, end);
      }
      return { start, end };
    })());
  }
}
