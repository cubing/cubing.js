// TODO: Pick a much better name.
export class PromiseFreshener<T> {
  #latestAssignedIdx = 0;
  #latestResolvedIdx = 0;

  // TODO: reject instead? Drop?
  async queue(
    p: Promise<T>,
  ): Promise<{ fresh: false } | { fresh: true; result: T }> {
    const idx = this.#latestAssignedIdx++;
    const result = await p;
    if (idx > this.#latestResolvedIdx) {
      this.#latestResolvedIdx = idx;
      return {
        fresh: true,
        result: result,
      };
    } else {
      return { fresh: false };
    }
  }
}
