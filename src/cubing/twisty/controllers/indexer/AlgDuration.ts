import {
  type Alg,
  type Commutator,
  type Conjugate,
  type Grouping,
  type LineComment,
  type Move,
  type Newline,
  type Pause,
  TraversalUp,
} from "../../../alg";
import type { MillisecondDuration } from "../AnimationTypes";

export function constantDurationForAmount(
  _amount: number,
): MillisecondDuration {
  return 1000 as MillisecondDuration;
}

export function defaultDurationForAmount(amount: number): MillisecondDuration {
  switch (Math.abs(amount)) {
    case 0:
      return 0 as MillisecondDuration;
    case 1:
      return 1000 as MillisecondDuration;
    case 2:
      return 1500 as MillisecondDuration;
    default:
      return 2000 as MillisecondDuration;
  }
}
export function ExperimentalScaledDefaultDurationForAmount(
  scale: number,
  amount: number,
): MillisecondDuration {
  switch (Math.abs(amount)) {
    case 0:
      return 0 as MillisecondDuration;
    case 1:
      return (scale * 1000) as MillisecondDuration;
    case 2:
      return (scale * 1500) as MillisecondDuration;
    default:
      return (scale * 2000) as MillisecondDuration;
  }
}

export class AlgDuration extends TraversalUp<MillisecondDuration> {
  // TODO: Pass durationForAmount as Down type instead?
  constructor(
    public durationForAmount: (
      amount: number,
    ) => MillisecondDuration = defaultDurationForAmount,
  ) {
    super();
  }

  public traverseAlg(alg: Alg): MillisecondDuration {
    let total = 0;
    for (const algNode of alg.childAlgNodes()) {
      total += this.traverseAlgNode(algNode);
    }
    return total as MillisecondDuration;
  }

  public traverseGrouping(grouping: Grouping): MillisecondDuration {
    return (grouping.amount *
      this.traverseAlg(grouping.alg)) as MillisecondDuration;
  }

  public traverseMove(move: Move): MillisecondDuration {
    return this.durationForAmount(move.amount);
  }

  public traverseCommutator(commutator: Commutator): MillisecondDuration {
    return (2 *
      (this.traverseAlg(commutator.A) +
        this.traverseAlg(commutator.B))) as MillisecondDuration;
  }

  public traverseConjugate(conjugate: Conjugate): MillisecondDuration {
    return (2 * this.traverseAlg(conjugate.A) +
      this.traverseAlg(conjugate.B)) as MillisecondDuration;
  }

  public traversePause(_pause: Pause): MillisecondDuration {
    return this.durationForAmount(1);
  }

  public traverseNewline(_newline: Newline): MillisecondDuration {
    return this.durationForAmount(1);
  }

  public traverseLineComment(_comment: LineComment): MillisecondDuration {
    return this.durationForAmount(0);
  }
}
