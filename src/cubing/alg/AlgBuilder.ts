import { Alg } from "./Alg";
import type { AlgNode } from "./alg-nodes/AlgNode";

/** @category Alg */
export class AlgBuilder {
  #algNode: AlgNode[] = [];

  push(u: AlgNode): void {
    this.#algNode.push(u);
  }

  // TODO: Allow FlexibleAlgSource?
  /** @deprecated */
  experimentalPushAlg(alg: Alg): void {
    // TODO: Optimize?
    for (const u of alg.childAlgNodes()) {
      this.push(u);
    }
  }

  // TODO: can we guarantee this to be fast in the permanent API?
  experimentalNumAlgNodes(): number {
    return this.#algNode.length;
  }

  // can be called multiple times, even if you push alg nodes inbetween.
  toAlg(): Alg {
    return new Alg(this.#algNode);
  }

  reset(): void {
    this.#algNode = [];
  }
}
