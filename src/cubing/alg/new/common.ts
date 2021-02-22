import { Alg } from "./Alg";
import { LeafUnit, Unit } from "./units/Unit";

export abstract class Comparable {
  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  is(c: any): boolean {
    return this instanceof c;
  }

  abstract isIdentical(other: Comparable): boolean;
}

export interface Repeatable extends Comparable {
  experimentalLeafUnits(): Generator<LeafUnit>;
}

// Common to algs or  unis
export abstract class AlgCommon<T extends Alg | Unit>
  extends Comparable
  implements Repeatable {
  abstract toString(): string;

  abstract inverse(): T;

  abstract experimentalLeafUnits(): Generator<LeafUnit>;
}

export function direct<T>(g: Iterable<T>, backwards: boolean): Iterable<T> {
  return backwards ? Array.from(g).reverse() : g;
}

export function reverse<T>(g: Iterable<T>): Iterable<T> {
  return Array.from(g).reverse();
}

// export type AlgContainerInfo = { alg: Alg; backwards: boolean }[];
// export interface AlgContainer {
//   containedAlgs(): AlgContainerInfo;
// }
