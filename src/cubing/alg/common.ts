import type { Alg } from "./Alg";
import type { AlgLeaf, AlgNode } from "./alg-nodes/AlgNode";
import type { IterationDirection } from "./iteration";
import type { ExperimentalSerializationOptions } from "./SerializationOptions";

let writeAlgDebugField = false;
export function setAlgDebugField(debug: boolean): void {
  writeAlgDebugField = debug;
}

export abstract class Comparable {
  is(c: any): boolean {
    return this instanceof c;
  }

  as<T>(c: new (...args: any) => T): T | null {
    return this instanceof c ? this : null;
  }

  abstract isIdentical(other: Comparable): boolean;
}

export interface Repeatable extends Comparable {
  experimentalExpand(
    iterDir?: IterationDirection,
    depth?: number,
  ): Generator<AlgLeaf>;
}

// Common to `Alg` or `AlgNode` classes.
export abstract class AlgCommon<T extends Alg | AlgNode>
  extends Comparable
  implements Repeatable
{
  constructor() {
    super();
    if (writeAlgDebugField) {
      Object.defineProperty(this, "_debugStr", {
        get: () => {
          return this.toString();
        },
      });
    }
  }

  get log(): (message?: any) => void {
    // By returning a (bound) version of `console.log`, we ensure that DevTools
    // logs the call site instead of this function.
    return console.log.bind(console, this, this.toString()) as (
      message?: any,
    ) => void;
  }

  abstract override toString(
    experimentalSerializationOptions?: ExperimentalSerializationOptions,
  ): string;

  abstract invert(): T;

  abstract experimentalExpand(iterDir: IterationDirection): Generator<AlgLeaf>;
}
