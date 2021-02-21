import { warnOnce } from "./warnOnce";

export class MoveQuantum {
  readonly #family: string;
  readonly #outerLayer: number | null;
  readonly #innerLayer: number | null;

  constructor(family: string, innerLayer?: number, outerLayer?: number) {
    this.#family = family;

    this.#outerLayer = outerLayer ?? null;
    const hasOuterLayer = this.#outerLayer !== null;

    this.#innerLayer = innerLayer ?? null;
    const hasInnerLayer = this.#innerLayer !== null;

    if (
      hasInnerLayer &&
      (!Number.isInteger(this.#outerLayer) || this.#outerLayer! < 1)
    ) {
      throw new Error("MoveQuantum inner layer must be a positive integer.");
    }

    if (
      hasInnerLayer &&
      (!Number.isInteger(this.#innerLayer) || this.#innerLayer! < 1)
    ) {
      throw new Error("MoveQuantum outer layer must be a positive integer.");
    }

    if (
      hasInnerLayer &&
      hasOuterLayer &&
      this.#innerLayer! >= this.#outerLayer!
    ) {
      throw new Error(
        "MoveQuantum outer layer must be smaller than inner layer.",
      );
    }

    if (hasOuterLayer && !hasInnerLayer) {
      throw new Error(
        "MoveQuantum with an outer layer must have an inner layer",
      ); // TODO: test
    }
  }

  // TODO: provide something more useful on average.
  /** @deprecated */
  get experimentalRawOuterLayer(): number | null {
    warnOnce("deprecated: experimentalRawOuterLayer");
    return this.#outerLayer;
  }

  // TODO: provide something more useful on average.
  /** @deprecated */
  get experimentalRawInnerLayer(): number | null {
    warnOnce("deprecated: experimentalRawInnerLayer");
    return this.#innerLayer;
  }

  toString(): string {
    let s = this.#family;
    if (this.#innerLayer !== null) {
      s = String(this.#innerLayer) + s;
      if (this.#outerLayer !== null) {
        s = String(this.#outerLayer) + "-" + s;
      }
    }
    return s;
  }
}
