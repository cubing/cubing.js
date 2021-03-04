import { Alg } from "./Alg";
import { IterationDirection } from "./iteration";
import { LeafUnit, Unit } from "./units/Unit";

let writeAlgDebugField = false;
export function setAlgDebugField(debug: boolean): void {
  writeAlgDebugField = debug;
}

export abstract class Comparable {
  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  is(c: any): boolean {
    return this instanceof c;
  }

  abstract isIdentical(other: Comparable): boolean;
}

export interface Repeatable extends Comparable {
  experimentalExpand(
    iterDir?: IterationDirection,
    depth?: number,
  ): Generator<LeafUnit>;
}

// Common to algs or units
export abstract class AlgCommon<T extends Alg | Unit>
  extends Comparable
  implements Repeatable {
  constructor() {
    super();
    if (writeAlgDebugField) {
      Object.defineProperty(this, "_debugStr", {
        get: function () {
          return this.toString();
        },
      });
    }
  }

  abstract toString(): string;

  abstract invert(): T;

  abstract experimentalExpand(iterDir: IterationDirection): Generator<LeafUnit>;
}
