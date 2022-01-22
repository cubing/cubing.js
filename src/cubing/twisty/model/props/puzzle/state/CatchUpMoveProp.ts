import type { Move } from "../../../../../alg";
import { SimpleTwistyPropSource } from "../../TwistyProp";

export interface CatchUpMove {
  move: Move | null;
  amount: number;
}

export class CatchUpMoveProp extends SimpleTwistyPropSource<CatchUpMove> {
  getDefaultValue(): CatchUpMove {
    return { move: null, amount: 0 };
  }

  canReuseValue(v1: CatchUpMove, v2: CatchUpMove) {
    return v1.move === v2.move && v1.amount === v2.amount;
  }
}
