import { Alg } from "./Alg";
import type { Unit } from "./units/Unit";

/** @category Alg */
export class AlgBuilder {
  #units: Unit[] = [];

  push(u: Unit): void {
    this.#units.push(u);
  }

  // TODO: Allow FlexibleAlgSource?
  /** @deprecated */
  experimentalPushAlg(alg: Alg): void {
    // TODO: Optimize?
    for (const u of alg.units()) {
      this.push(u);
    }
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
