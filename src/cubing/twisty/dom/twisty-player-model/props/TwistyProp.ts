import PLazy from "../../../../vendor/p-lazy";
import { addDebugger } from "./TwistyPropDebugger";

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
  constructor() {
    addDebugger(this);
  }

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
  // Synchronously marks all descendants as stale. This doesn't actually
  // literally mark as stale, but it updates the last source generation, which
  // is used to tell if a cahced result is stale.
  protected markStale(sourceEvent: SourceEvent<any>): void {
    if (sourceEvent.detail.generation !== globalSourceGeneration) {
      // The full stale propagation is synchronous, so there should not be a new one yet.
      throw new Error("A TwistyProp was marked stale too late!");
    }
    if (this.lastSourceGeneration === sourceEvent.detail.generation) {
      // Already propagated.
      return;
    }
    this.lastSourceGeneration = sourceEvent.detail.generation;
    for (const child of this.#children) {
      child.markStale(sourceEvent);
    }
    // We schedule sending out events *after* the (synchronous) propagation has happened, in
    // case one of the listeners updates a source again.
    this.#scheduleDispatch();
  }

  #listeners: Set<() => void> = new Set();
  addListener(listener: () => void, options?: { initial: boolean }): void {
    this.#listeners.add(listener);
    if (options?.initial) {
      listener(); // TODO: wrap in a try?
    }
  }

  removeListener(listener: () => void): void {
    this.#listeners.delete(listener);
  }

  #scheduleDispatch(): void {
    this.#dispatchPending = true;
    setTimeout(() => this.#dispatchListeners(), 0);
  }

  #dispatchPending: boolean = false;
  #dispatchListeners(): void {
    if (this.#dispatchPending) {
      for (const listener of this.#listeners) {
        listener(); // TODO: wrap in a try?
      }
      this.#dispatchPending = false;
    }
  }
}

export abstract class TwistyPropSource<
  OutputType,
  InputType = OutputType,
> extends TwistyPropParent<OutputType> {
  #value: Promise<OutputType>;

  protected abstract getDefaultValue(): PromiseOrValue<OutputType>;

  constructor(initialValue?: PromiseOrValue<InputType>) {
    super();
    this.#value = PLazy.from(() => this.getDefaultValue());
    if (initialValue) {
      this.#value = this.deriveFromPromiseOrValue(initialValue, this.#value);
    }
  }

  set(input: PromiseOrValue<InputType>): void {
    this.#value = this.deriveFromPromiseOrValue(input, this.#value);

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
    return this.#value;
  }

  async deriveFromPromiseOrValue(
    input: PromiseOrValue<InputType>,
    oldValuePromise: Promise<OutputType>,
  ): Promise<OutputType> {
    return this.derive(await input, oldValuePromise);
  }

  // TODO: add an indirect layer to cache the derivation?
  protected abstract derive(
    input: InputType,
    oldValuePromise: Promise<OutputType>,
  ): PromiseOrValue<OutputType>;
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
    const generation = this.lastSourceGeneration;

    const cachedResult = this.#cachedResult;
    if (!cachedResult) {
      return this.#cacheDerive(this.#getParents(), generation);
    }

    // If the cached result generation matches the last time, the calculation
    // can't be stale, so we can immediately return (the `Promise` for) it
    // without doing an equality checks.
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
