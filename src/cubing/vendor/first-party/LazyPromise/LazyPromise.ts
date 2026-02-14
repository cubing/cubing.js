type LazyExecutor<T> = (() => Promise<T>) | (() => T);

// Note: static methods are not implemented, as we do not need them yet. `.withResolvers()` might be useful, though.
export class LazyPromise<T> implements Promise<T> {
  #executor: LazyExecutor<T>;
  constructor(executor: LazyExecutor<T>) {
    this.#executor = executor;
  }

  #cached: Promise<T> | undefined;
  async #getCached(): Promise<T> {
    // Note that we use `Promise.resolve(…)` to preserve correct semantics in case the type of `T` is `undefined` or `null` (which could be returned by a synchronous executor).
    return (this.#cached ??= Promise.resolve(this.#executor()));
  }

  // Type signature from TypeScript
  // biome-ignore lint/suspicious/noThenProperty: We're implementing the `Promise` API!
  async then<TResult1 = T, TResult2 = never>(
    onfulfilled?:
      | ((value: T) => TResult1 | PromiseLike<TResult1>)
      | undefined
      | null,
    onrejected?:
      | ((reason: any) => TResult2 | PromiseLike<TResult2>)
      | undefined
      | null,
  ): Promise<TResult1 | TResult2> {
    return this.#getCached().then(onfulfilled, onrejected);
  }

  // Type signature from TypeScript
  catch<TResult = never>(
    onrejected?:
      | ((reason: any) => TResult | PromiseLike<TResult>)
      | undefined
      | null,
  ): Promise<T | TResult> {
    return this.#getCached().catch(onrejected);
  }

  // Type signature from TypeScript
  async finally(onfinally?: (() => void) | undefined | null): Promise<T> {
    return this.#getCached().finally(onfinally);
  }

  get [Symbol.toStringTag](): string {
    return "LazyPromise";
  }
}
