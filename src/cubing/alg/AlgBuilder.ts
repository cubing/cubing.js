import { Alg } from "./Alg";
import type { Unit } from "./units/Unit";

export class AlgBuilder {
  #units: Unit[] = [];

  push(u: Unit): void {
    this.#units.push(u);
  }

  // TODO: can we guarantee this to be fast in the permanent API?
  experimentalNumUnits(): number {
    return this.#units.length;
  }

  // can be called multiple times, even if you push units inbetween.
  toAlg(): Alg {
    return new Alg(this.#units);
  }

  reset(): void {
    this.#units = [];
  }
}
