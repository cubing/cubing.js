import {
  BlockMove,
  Commutator,
  Conjugate,
  Pause,
  Group,
  NewLine,
  Comment,
  Sequence,
  TraversalUp,
} from "../../src/cubing/alg/index";

/*
 *   For movecount, that understands puzzle rotations.  This code
 *   should be moved to the alg class, probably.
 */
class MoveCounter extends TraversalUp<number> {
  constructor(private metric: (move: BlockMove) => number) {
    super();
  }

  public traverseSequence(sequence: Sequence): number {
    let r = 0;
    for (let i = 0; i < sequence.nestedUnits.length; i++) {
      r += this.traverse(sequence.nestedUnits[i]);
    }
    return r;
  }

  public traverseGroup(group: Group): number {
    return this.traverse(group.nestedSequence) * Math.abs(group.amount);
  }

  public traverseBlockMove(move: BlockMove): number {
    return this.metric(move);
  }

  public traverseCommutator(commutator: Commutator): number {
    return (
      Math.abs(commutator.amount) *
      2 *
      (this.traverse(commutator.A) + this.traverse(commutator.B))
    );
  }

  public traverseConjugate(conjugate: Conjugate): number {
    return (
      Math.abs(conjugate.amount) *
      (2 * this.traverse(conjugate.A) + this.traverse(conjugate.B))
    );
  }

  // TODO: Remove spaces between repeated pauses (in traverseSequence)
  public traversePause(_pause: Pause): number {
    return 0;
  }

  public traverseNewLine(_newLine: NewLine): number {
    return 0;
  }

  // TODO: Enforce being followed by a newline (or the end of the alg)?
  public traverseComment(_comment: Comment): number {
    return 0;
  }
}

function isCharUppercase(c: string): boolean {
  return "A" <= c && c <= "Z";
}

function baseMetric(move: BlockMove): number {
  const fam = move.family;
  if (
    (isCharUppercase(fam[0]) && fam[fam.length - 1] === "v") ||
    fam === "x" ||
    fam === "y" ||
    fam === "z"
  ) {
    return 0;
  } else {
    return 1;
  }
}

const baseCounter = new MoveCounter(baseMetric);
export const countMoves = baseCounter.traverse.bind(baseCounter);
