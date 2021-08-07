type InputProps<T extends Object> = {
  [s in keyof T]: TwistyPropParent<T[s]>;
};

type InputPromises<T extends Object> = {
  [s in keyof T]: Promise<T[s]>;
};

interface SourceEventDetail<OutputType> {
  sourceProp: TwistyPropSource<OutputType, any>;
  value: Promise<OutputType>; // TODO: remove?
  generation: number;
}

type SourceEvent<T> = CustomEvent<SourceEventDetail<T>>;

type PromiseOrValue<T> = T | Promise<T>;

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

  #children: Set<TwistyPropDerived<any, any>> = new Set();
  protected addChild(child: TwistyPropDerived<any, any>): void {
    this.#children.add(child);
  }

  protected removeChild(child: TwistyPropDerived<any, any>): void {
    this.#children.delete(child);
  }

  protected lastSourceGeneration: number = 0;
  // Synchronously marks all descendants as stale.
  markStale(sourceEvent: SourceEvent<any>): void {
    console.log(
      "Generation",
      sourceEvent.detail.generation,
      "Marking stale",
      this.constructor.name,
    );
    if (this.lastSourceGeneration === sourceEvent.detail.generation) {
      // Already propagated.
      return;
    }
    this.lastSourceGeneration = sourceEvent.detail.generation;
    for (const child of this.#children) {
      child.markStale(sourceEvent);
    }
    // TODO: do we need to avoid interference from the listeners (e.g. changing the prop graph)?
    // Can we move this earlier for better perf?
    this.dispatchListeners();
  }

  #listeners: Set<() => void> = new Set();
  addListener(listener: () => void): void {
    this.#listeners.add(listener);
  }

  removeListener(listener: () => void): void {
    this.#listeners.delete(listener);
  }

  dispatchListeners(): void {
    for (const listener of this.#listeners) {
      listener();
    }
  }
}

export abstract class TwistyPropSource<
  OutputType,
  InputType = OutputType,
> extends TwistyPropParent<OutputType> {
  #value: Promise<OutputType>;

  abstract getDefaultValue(): PromiseOrValue<OutputType>;

  constructor(initialValue?: PromiseOrValue<InputType>) {
    super();
    this.#value = initialValue
      ? this.deriveFromPromiseOrValue(initialValue)
      : Promise.resolve(this.getDefaultValue());
  }

  set(input: PromiseOrValue<InputType>): void {
    this.#value = this.deriveFromPromiseOrValue(input);

    const sourceEventDetail: SourceEventDetail<OutputType> = {
      sourceProp: this,
      value: this.#value,
      generation: ++globalSourceGeneration,
    };
    this.markStale(
      new CustomEvent<SourceEventDetail<OutputType>>("stale", {
        detail: sourceEventDetail,
      }),
    );
  }

  async get(): Promise<OutputType> {
    console.log("get source", this.constructor.name, this.lastSourceGeneration);
    return this.#value;
  }

  async deriveFromPromiseOrValue(
    input: PromiseOrValue<InputType>,
  ): Promise<OutputType> {
    return this.derive(await input);
  }

  // TODO: add an indirect layer to cache the derivation?
  protected abstract derive(input: InputType): PromiseOrValue<OutputType>;
}

export abstract class SimpleTwistyPropSource<
  SimpleType,
> extends TwistyPropSource<SimpleType> {
  derive(input: SimpleType): PromiseOrValue<SimpleType> {
    return input;
  }
}

// TODO: Can / should we support `null` as a valid output value?
export abstract class TwistyPropDerived<
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
      parent.addChild(this);
    }
  }

  public async get(): Promise<OutputType> {
    console.log(
      "get derived",
      this.constructor.name,
      this.lastSourceGeneration,
    );

    const generation = this.lastSourceGeneration;

    const cachedResult = this.#cachedResult;
    if (!cachedResult) {
      return this.#cacheDerive(this.#getParents(), generation);
    }

    if (cachedResult.generation === generation) {
      return cachedResult.output;
    }

    const inputs = await this.#getParents();

    for (const key in this.#parents) {
      const parent = this.#parents[key];
      if (!parent.canReuse(inputs[key], cachedResult.inputs[key])) {
        return this.#cacheDerive(inputs, generation);
      }
    }
    return cachedResult.output;
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

  async #cacheDerive(
    inputsPromise: PromiseOrValue<InputTypes>,
    generation: number,
  ): Promise<OutputType> {
    const output = Promise.resolve(this.derive(await inputsPromise));
    this.#cachedResult = {
      inputs: await inputsPromise,
      output: output,
      generation,
    };
    return output;
  }

  protected abstract derive(input: InputTypes): PromiseOrValue<OutputType>;
}
