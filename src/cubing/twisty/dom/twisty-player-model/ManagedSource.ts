type InputProps<T extends Object> = {
  [s in keyof T]: TwistyPropParent<T[s]>;
};

type InputPromises<T extends Object> = {
  [s in keyof T]: Promise<T[s]>;
};

export abstract class TwistyPropParent<T> {
  public abstract get(): Promise<T>;

  // Uses value comparison. Overwrite with a cheap semantic comparison when
  // possible.
  canReuse(v1: T, v2: T): boolean {
    return v1 === v2;
  }
}

export abstract class TwistySourceProp<T> extends TwistyPropParent<T> {
  #value: Promise<T>;

  constructor(initialValue: T | Promise<T>) {
    super();
    this.#value = Promise.resolve(initialValue);
  }

  // TODO: Accept promise?
  set(t: T | Promise<T>): void {
    this.#value = Promise.resolve(t);
  }

  async get(): Promise<T> {
    return this.#value;
  }
}

// TODO: Can / should we support `null` as a valid output value?
export abstract class TwistyPropV2<
  InputTypes extends Object,
  OutputType,
> extends TwistyPropParent<OutputType> {
  // cachedInputs:
  #parents: InputProps<InputTypes>;

  #cachedResult: { inputs: InputTypes; output: Promise<OutputType> } | null =
    null;

  constructor(parents: InputProps<InputTypes>) {
    super();
    this.#parents = parents;
  }

  public async get(): Promise<OutputType> {
    const inputs = await this.#getParents();

    console.log(this, inputs, this.#cachedResult);

    const cachedResult = this.#cachedResult;
    const fromCache = (): Promise<OutputType> | null => {
      if (cachedResult) {
        for (const key in this.#parents) {
          const parent = this.#parents[key];
          if (!parent.canReuse(inputs[key], cachedResult.inputs[key])) {
            console.log("continue!");
            return null;
          }
        }
        return cachedResult.output;
      }
      return null;
    };

    return fromCache() ?? this.#cacheDerive(inputs);
  }

  async #getParents(): Promise<InputTypes> {
    const inputValuePromises: InputPromises<InputTypes> = {} as any; // TODO
    for (const key in this.#parents) {
      inputValuePromises[key] = this.#parents[key].get();
    }

    const inputs: InputTypes = {} as any; // TODO
    for (const key in this.#parents) {
      inputs[key] = await inputValuePromises[key];
    }
    return inputs;
  }

  #cacheDerive(inputs: InputTypes): Promise<OutputType> {
    const output = this.derive(inputs);
    this.#cachedResult = { inputs, output };
    return output;
  }

  protected abstract derive(input: InputTypes): Promise<OutputType>;

  // TODO: Async?
  // protected abstract canReuse(v1: OutputType, v2: OutputType): boolean;
}

// interface GenerationalLazyPromise<T> {
//   generation: number;
//   lazyPromise: Promise<T>;
// }

// interface LazyPromiseEventDetail<T> {
//   lazyPromise: GenerationalLazyPromise<T>;
// }

// type LazyPromiseEvent<T> = CustomEvent<LazyPromiseEventDetail<T>>;

// let globalGenerationCounter = 0;

// TODO: add stale marker?
// export class ManagedSource<T> extends EventTarget {
//   #target: TwistyPropV2<T>;
//   constructor(target: TwistyPropV2<T>, private listener: () => {}) {
//     super();
//     // this.set(target);
//     this.#target = target;
//     this.#target.addEventListener("update", this.#onUpdate.bind(this));
//   }

//   value(): Promise<T> {}

//   #onUpdate(event: LazyPromiseEvent<T>): void {
//     this.#lazyPromise = event.detail.lazyPromise;
//   }

//   get target(): TwistyPropV2<T> {
//     return this.#target;
//   }
// }

// Principles:
// - Any time a value is derived, it uses a consistent set of input generations.
// - Values are immutable.
// - Don't derive any value unless someone awaits it. To start an expensive operation, get someone to await a derived value that depends on it.

// TODO: Isolating reused objects (e.g. Twisty3D)
