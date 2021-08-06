type InputProps<T extends Object> = {
  [s in keyof T]: TwistyPropParent<T[s]>;
};

type InputPromises<T extends Object> = {
  [s in keyof T]: Promise<T[s]>;
};

// Values of T must be immutable.
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

  set(t: T | Promise<T>): void {
    this.#value = Promise.resolve(t);
  }

  async get(): Promise<T> {
    return this.#value;
  }
}

// TODO: Can / should we support `null` as a valid output value?
export abstract class TwistyProp<
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
    return this.fromCache(inputs) ?? this.#cacheDerive(inputs);
  }

  fromCache(inputs: InputTypes): Promise<OutputType> | null {
    const cachedResult = this.#cachedResult;
    if (cachedResult) {
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
    this.#cachedResult = { inputs, output };
    return output;
  }

  protected abstract derive(input: InputTypes): Promise<OutputType>;
}
