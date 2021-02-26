// TODO: turn this file somewhere permanent.
import {
  Alg,
  Grouping,
  LineComment,
  Commutator,
  Conjugate,
  Turn,
  Newline,
  Pause,
  TraversalUp,
} from "../../alg/index";

/*
 *   For turncount, that understands puzzle rotations.  This code
 *   should be moved to the alg class, probably.
 */
class TurnCounter extends TraversalUp<number> {
  constructor(private metric: (turn: Turn) => number) {
    super();
  }

  public traverseAlg(alg: Alg): number {
    let r = 0;
    for (const unit of alg.units()) {
      r += this.traverseUnit(unit);
    }
    return r;
  }

  public traverseGrouping(grouping: Grouping): number {
    return (
      this.traverseUnit(grouping.experimentalAlg) *
      Math.abs(grouping.experimentalEffectiveAmount)
    );
  }

  public traverseTurn(turn: Turn): number {
    return this.metric(turn);
  }

  public traverseCommutator(commutator: Commutator): number {
    return (
      Math.abs(commutator.experimentalEffectiveAmount) *
      2 *
      (this.traverseAlg(commutator.A) + this.traverseAlg(commutator.B))
    );
  }

  public traverseConjugate(conjugate: Conjugate): number {
    return (
      Math.abs(conjugate.experimentalEffectiveAmount) *
      (2 * this.traverseAlg(conjugate.A) + this.traverseAlg(conjugate.B))
    );
  }

  // TODO: Remove spaces between repeated pauses (in traverseSequence)
  public traversePause(_pause: Pause): number {
    return 0;
  }

  public traverseNewline(_newLine: Newline): number {
    return 0;
  }

  // TODO: Enforce being followed by a newline (or the end of the alg)?
  public traverseLineComment(_comment: LineComment): number {
    return 0;
  }
}

function isCharUppercase(c: string): boolean {
  return "A" <= c && c <= "Z";
}

function baseMetric(turn: Turn): number {
  const fam = turn.family;
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

const turnCounter = new TurnCounter(baseMetric);
export const countTurns = turnCounter.traverseAlg.bind(turnCounter);
