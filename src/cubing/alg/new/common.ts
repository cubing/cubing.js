import { Alg } from "./Alg";
import { Unit } from "./Unit";

export abstract class Comparable {
  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  is(c: any): boolean {
    return this instanceof c;
  }

  abstract isIdentical(other: Comparable): boolean;
}

// Common to algs or  unis
export abstract class AlgCommon<T extends Alg | Unit> extends Comparable {
  abstract toString(): string;

  abstract inverse(): T;
}

export function reverse<T>(g: Iterable<T>): Iterable<T> {
  return Array.from(g).reverse();
}

// export type AlgContainerInfo = { alg: Alg; backwards: boolean }[];
// export interface AlgContainer {
//   containedAlgs(): AlgContainerInfo;
// }
