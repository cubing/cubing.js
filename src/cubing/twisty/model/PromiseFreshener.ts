// TODO: Pick a much better name.
export class PromiseFreshener<T> {
  #latestAssignedIdx = 0;
  #latestResolvedIdx = 0;

  // TODO: reject instead? Drop?
  async queue(
    p: Promise<T>,
  ): Promise<{ fresh: false } | { fresh: true; result: T }> {
    const idx = ++this.#latestAssignedIdx;
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

// This will silenty drop a queued Promise (i.e. not resolve it) if a
// newer queued one already resolved first. This is useful for classes that want
// to know the "latest" state of something without jumping back to an older
// value by accident.
// TODO: Remove this because it's too easy to misuse?
export class StaleDropper<T> {
  #latestAssignedIdx = 0;
  #latestResolvedIdx = 0;

  queue(p: Promise<T>): Promise<T> {
    // biome-ignore lint/suspicious/noAsyncPromiseExecutor: This is a very rare case where we *do* want to drop a Promise sometimes.
    return new Promise(async (resolve, reject) => {
      try {
        const idx = ++this.#latestAssignedIdx;
        const result = await p;
        if (idx > this.#latestResolvedIdx) {
          this.#latestResolvedIdx = idx;
          resolve(result);
        }
      } catch (e) {
        reject(e);
      }
    });
  }
}
