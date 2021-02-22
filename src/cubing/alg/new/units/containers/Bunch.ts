import { Alg } from "../../Alg";
import { AlgCommon, Comparable } from "../../common";
import { IterationDirection } from "../../iteration";
import { Repetition, RepetitionInfo } from "../Repetition";
import { LeafUnit } from "../Unit";

export class Bunch extends AlgCommon<Bunch> {
  readonly #repetition: Repetition<Alg>;

  constructor(alg: Alg, repetitionInfo: RepetitionInfo) {
    super();
    this.#repetition = new Repetition(alg, repetitionInfo);
  }

  isIdentical(other: Comparable): boolean {
    const otherAsBunch = other as Bunch;
    return (
      other.is(Bunch) && this.#repetition.isIdentical(otherAsBunch.#repetition)
    );
  }

  inverse(): Bunch {
    return new Bunch(
      this.#repetition.quantum,
      this.#repetition.inverse().info(),
    );
  }

  *experimentalLeafUnits(
    iterDir: IterationDirection = IterationDirection.Forwards,
  ): Generator<LeafUnit> {
    yield* this.#repetition.experimentalLeafUnits(iterDir);
  }

  static fromString(): Bunch {
    throw new Error("unimplemented");
  }

  toString(): string {
    return `(${this.#repetition.quantum.toString()})${this.#repetition.suffix()}`;
  }

  // toJSON(): BunchJSON {
  //   return {
  //     type: "bunch",
  //     alg: this.#quanta.quantum.toJSON(),
  //   };
  // }
}
