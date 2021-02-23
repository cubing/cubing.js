import { Alg } from "./Alg";
import { Unit } from "./units/Unit";

export class AlgBuilder {
  #units: Unit[] = [];

  push(u: Unit): void {
    this.#units.push(u);
  }

  // can be called multiple times, even if you push units inbetween.
  toAlg(): Alg {
    return new Alg(this.#units);
  }
}
