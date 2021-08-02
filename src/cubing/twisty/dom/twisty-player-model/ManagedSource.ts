// TODO: add stale marker?
export class ManagedSource<T extends EventTarget> extends EventTarget {
  #target: T; // TODO: | null
  constructor(target: T, private listener: () => {}) {
    super();
    // this.set(target);
    this.#target = target;
    this.#target.addEventListener("update", this.listener);
  }

  get target(): T {
    return this.#target;
  }
}
