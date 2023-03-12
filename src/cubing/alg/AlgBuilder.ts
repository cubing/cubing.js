import { Alg } from "./Alg";
import type { AlgNode } from "./alg-nodes/AlgNode";

/** @category Alg */
export class AlgBuilder {
  #algNodes: AlgNode[] = [];

  push(u: AlgNode): void {
    this.#algNodes.push(u);
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
    return this.#algNodes.length;
  }

  // can be called multiple times, even if you push alg nodes inbetween.
  toAlg(): Alg {
    return new Alg(this.#algNodes);
  }

  reset(): void {
    this.#algNodes = [];
  }
}
