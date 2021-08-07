type InputProps<T extends Object> = {
  [s in keyof T]: TwistyPropParent<T[s]>;
};

type InputPromises<T extends Object> = {
  [s in keyof T]: Promise<T[s]>;
};

interface SourceEventDetail<T> {
  sourceProp: TwistyPropSource<T>;
  value: Promise<T>;
  generation: number;
}

type SourceEvent<T> = CustomEvent<SourceEventDetail<T>>;

// Values of T must be immutable.
let globalSourceGeneration = 0; // This is incremented before being used, so 1 will be the first active value.
export abstract class TwistyPropParent<T> {
  public abstract get(): Promise<T>;

  // Uses value comparison. Overwrite with a cheap semantic comparison when
  // possible.
  canReuse(v1: T, v2: T): boolean {
    return v1 === v2;
  }

  // Propagation

  #children: Set<TwistyDerivedProp<any, any>> = new Set();
  addChild(child: TwistyDerivedProp<any, any>): void {
    this.#children.add(child);
  }

  removeChild(child: TwistyDerivedProp<any, any>): void {
    this.#children.delete(child);
  }

  protected lastSourceGeneration: number = 0;
  // Synchronously marks all descendants as stale.
  markStale(sourceEvent: SourceEvent<any>): void {
    if (this.lastSourceGeneration === sourceEvent.detail.generation) {
      // Already propagated.
      return;
    }
    this.lastSourceGeneration = sourceEvent.detail.generation;
    for (const child of this.#children) {
      child.markStale(sourceEvent);
    }
  }
}

export abstract class TwistyPropSource<T> extends TwistyPropParent<T> {
  #value: Promise<T>;

  constructor(initialValue: T | Promise<T>) {
    super();
    this.#value = Promise.resolve(initialValue);
  }

  set(t: T | Promise<T>): void {
    this.#value = Promise.resolve(t);

    const sourceEventDetail: SourceEventDetail<T> = {
      sourceProp: this,
      value: this.#value,
      generation: ++globalSourceGeneration,
    };
    this.markStale(
      new CustomEvent<SourceEventDetail<T>>("stale", {
        detail: sourceEventDetail,
      }),
    );
  }

  async get(): Promise<T> {
    return this.#value;
  }
}

// TODO: Can / should we support `null` as a valid output value?
export abstract class TwistyDerivedProp<
  InputTypes extends Object,
  OutputType,
> extends TwistyPropParent<OutputType> {
  // cachedInputs:
  #parents: InputProps<InputTypes>;

  #cachedResult: {
    inputs: InputTypes;
    output: Promise<OutputType>;
    generation: number;
  } | null = null;

  constructor(parents: InputProps<InputTypes>) {
    super();
    this.#parents = parents;
    for (const parent of Object.values(parents)) {
      this.addChild(parent);
    }
  }

  public async get(): Promise<OutputType> {
    const inputs = await this.#getParents();
    return this.fromCache(inputs) ?? this.#cacheDerive(inputs);
  }

  fromCache(inputs: InputTypes): Promise<OutputType> | null {
    const cachedResult = this.#cachedResult;
    if (cachedResult) {
      if (cachedResult.generation === this.lastSourceGeneration) {
        return cachedResult.output;
      }

      for (const key in this.#parents) {
        const parent = this.#parents[key];
        if (!parent.canReuse(inputs[key], cachedResult.inputs[key])) {
          return null;
        }
      }
      return cachedResult.output;
    }
    return null;
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
    this.#cachedResult = {
      inputs,
      output,
      generation: this.lastSourceGeneration,
    };
    return output;
  }

  protected abstract derive(input: InputTypes): Promise<OutputType>;
}
