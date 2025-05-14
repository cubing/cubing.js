export class InitialValueTracker<T> {
  #resolve: (t: T) => void;
  reject: (e?: Error) => void; // TODO: AbortController?
  promise: Promise<T>;
  constructor() {
    const { promise, resolve, reject } = Promise.withResolvers<T>();
    this.promise = promise;
    this.#resolve = resolve;
    this.reject = reject;
  }
  handleNewValue(t: T): void {
    this.#resolve(t);
  }
}
