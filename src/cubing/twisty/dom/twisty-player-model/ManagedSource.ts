abstract class TwistyPropV2<T> extends EventTarget {
  // MUST propagate to all children synchronously.
  latestGeneration: number = 0;
  propagateLazyPromise(generation: number): void {
    if (generation <= this.latestGeneration) {
      return;
    }
    this.dispatchEvent(new CustomEvent("update", this.derive.bind(this)));
    this.latestGeneration = generation;
  }

  abstract derive(): Promise<T>;
}

interface GenerationalLazyPromise<T> {
  generation: number;
  lazyPromise: Promise<T>;
}

interface LazyPromiseEventDetail<T> {
  lazyPromise: GenerationalLazyPromise<T>;
}

type LazyPromiseEvent<T> = CustomEvent<LazyPromiseEventDetail<T>>;

let globalGenerationCounter = 0;

// TODO: add stale marker?
export class ManagedSource<T> extends EventTarget {
  #lazyPromise: GenerationalLazyPromise<T>;

  #target: TwistyPropV2<T>;
  constructor(target: TwistyPropV2<T>, private listener: () => {}) {
    super();
    // this.set(target);
    this.#target = target;
    this.#target.addEventListener("update", this.#onUpdate.bind(this));
  }

  #onUpdate(event: LazyPromiseEvent<T>): void {
    this.#lazyPromise = event.detail.lazyPromise;
  }

  get target(): TwistyPropV2<T> {
    return this.#target;
  }
}

// Principles:
// - Any time a value is derived, it uses a consistent set of input generations.
// - Values are immutable.
// - Don't derive any value unless someone awaits it. To start an expensive operation, get someone to await a derived value that depends on it.

// TODO: Isolating reused objects (e.g. Twisty3D)
