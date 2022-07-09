export class InitialValueTracker<T> {
  #resolve: (t: T) => void;
  reject: (e?: Error) => void; // TODO: AbortController?
  promise = new Promise<T>((resolve, reject) => {
    this.#resolve = resolve;
    this.reject = reject;
  });
  handleNewValue(t: T): void {
    this.#resolve(t);
  }
}
