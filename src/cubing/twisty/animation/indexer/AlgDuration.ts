import {
  BlockMove,
  Comment,
  Commutator,
  Conjugate,
  Group,
  NewLine,
  Pause,
  Sequence,
  TraversalUp,
} from "../../../alg";
import { Duration } from "../cursor/CursorTypes";

export function constantDurationForAmount(_amount: number): Duration {
  return 1000;
}

export function defaultDurationForAmount(amount: number): Duration {
  switch (Math.abs(amount)) {
    case 0:
      return 0;
    case 1:
      return 1000;
    case 2:
      return 1500;
    default:
      return 2000;
  }
}
// eslint-disable-next-line no-inner-declarations
export function ExperimentalScaledDefaultDurationForAmount(
  scale: number,
  amount: number,
): Duration {
  switch (Math.abs(amount)) {
    case 0:
      return 0;
    case 1:
      return scale * 1000;
    case 2:
      return scale * 1500;
    default:
      return scale * 2000;
  }
}

export class AlgDuration extends TraversalUp<Duration> {
  // TODO: Pass durationForAmount as Down type instead?
  constructor(
    public durationForAmount: (
      amount: number,
    ) => Duration = defaultDurationForAmount,
  ) {
    super();
  }

  public traverseSequence(sequence: Sequence): Duration {
    let total = 0;
    for (const alg of sequence.nestedUnits) {
      total += this.traverse(alg);
    }
    return total;
  }

  public traverseGroup(group: Group): Duration {
    return group.amount * this.traverse(group.nestedSequence);
  }

  public traverseBlockMove(blockMove: BlockMove): Duration {
    return this.durationForAmount(blockMove.amount);
  }

  public traverseCommutator(commutator: Commutator): Duration {
    return (
      commutator.amount *
      2 *
      (this.traverse(commutator.A) + this.traverse(commutator.B))
    );
  }

  public traverseConjugate(conjugate: Conjugate): Duration {
    return (
      conjugate.amount *
      (2 * this.traverse(conjugate.A) + this.traverse(conjugate.B))
    );
  }

  public traversePause(_pause: Pause): Duration {
    return this.durationForAmount(1);
  }

  public traverseNewLine(_newLine: NewLine): Duration {
    return this.durationForAmount(1);
  }

  public traverseComment(_comment: Comment): Duration {
    return this.durationForAmount(0);
  }
}
