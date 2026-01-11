export class InitialValueTracker<T> {
  // @ts-expect-error: We do initialize this synchronously (assuming no one has tampered with the `Promise` constructor).
  #resolve: (t: T) => void;
  // @ts-expect-error: We do initialize this synchronously (assuming no one has tampered with the `Promise` constructor).
  reject: (e?: Error) => void; // TODO: AbortController?
  promise: Promise<T>;
  constructor() {
    this.promise = new Promise((resolve, reject) => {
      this.#resolve = resolve;
      this.reject = reject;
    });
  }
  handleNewValue(t: T): void {
    this.#resolve(t);
  }
}
