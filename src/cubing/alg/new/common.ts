import { Alg } from "./Alg";
import { IterationDirection } from "./iteration";
import { LeafUnit, Unit } from "./units/Unit";

let debugAlgs = false;
export function setDebug(debug: boolean): void {
  debugAlgs = debug;
}

export abstract class Comparable {
  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  is(c: any): boolean {
    return this instanceof c;
  }

  abstract isIdentical(other: Comparable): boolean;
}

export interface Repeatable extends Comparable {
  experimentalLeafUnits(iterDir: IterationDirection): Generator<LeafUnit>;
}

// Common to algs or units
export abstract class AlgCommon<T extends Alg | Unit>
  extends Comparable
  implements Repeatable {
  constructor() {
    super();
    if (debugAlgs) {
      Object.defineProperty(this, "_debugStr", {
        get: function () {
          return this.toString();
        },
      });
    }
  }

  abstract toString(): string;

  abstract inverse(): T;

  abstract experimentalLeafUnits(
    iterDir: IterationDirection,
  ): Generator<LeafUnit>;
}
