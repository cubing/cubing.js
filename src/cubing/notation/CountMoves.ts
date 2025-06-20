// TODO: move this file somewhere permanent.
import {
  type Alg,
  type Commutator,
  type Conjugate,
  functionFromTraversal,
  type Grouping,
  type LineComment,
  type Move,
  type Newline,
  type Pause,
  TraversalUp,
} from "../alg";
import type { PuzzleLoader } from "../puzzles";
import { CommonMetric } from "./commonMetrics";
import { costFactorsByMetric, countMove3x3x3 } from "./cube3x3x3Metrics";

/*
 *   For movecount, that understands puzzle rotations.  This code
 *   should be moved to the alg class, probably.
 */
class CountMoves extends TraversalUp<number> {
  constructor(private metric: (move: Move) => number) {
    super();
  }

  public traverseAlg(alg: Alg): number {
    let r = 0;
    for (const algNode of alg.childAlgNodes()) {
      r += this.traverseAlgNode(algNode);
    }
    return r;
  }

  public traverseGrouping(grouping: Grouping): number {
    const alg: Alg = grouping.alg;
    return this.traverseAlg(alg) * Math.abs(grouping.amount);
  }

  public traverseMove(move: Move): number {
    return this.metric(move);
  }

  public traverseCommutator(commutator: Commutator): number {
    return (
      2 * (this.traverseAlg(commutator.A) + this.traverseAlg(commutator.B))
    );
  }

  public traverseConjugate(conjugate: Conjugate): number {
    return 2 * this.traverseAlg(conjugate.A) + this.traverseAlg(conjugate.B);
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

// TODO
class CountLeavesInExpansionForSimultaneousMoveIndexer extends TraversalUp<number> {
  public traverseAlg(alg: Alg): number {
    let r = 0;
    for (const algNode of alg.childAlgNodes()) {
      r += this.traverseAlgNode(algNode);
    }
    return r;
  }

  public traverseGrouping(grouping: Grouping): number {
    const alg: Alg = grouping.alg;
    return this.traverseAlg(alg) * Math.abs(grouping.amount);
  }

  public traverseMove(_move: Move): number {
    return 1;
  }

  public traverseCommutator(commutator: Commutator): number {
    return (
      2 * (this.traverseAlg(commutator.A) + this.traverseAlg(commutator.B))
    );
  }

  public traverseConjugate(conjugate: Conjugate): number {
    return 2 * this.traverseAlg(conjugate.A) + this.traverseAlg(conjugate.B);
  }

  // TODO: Remove spaces between repeated pauses (in traverseSequence)
  public traversePause(_pause: Pause): number {
    return 1;
  }

  public traverseNewline(_newLine: Newline): number {
    return 1;
  }

  // TODO: Enforce being followed by a newline (or the end of the alg)?
  public traverseLineComment(_comment: LineComment): number {
    return 1;
  }
}

function isCharUppercase(c: string): boolean {
  return "A" <= c && c <= "Z";
}

// TODO: Implement a puzzle-specific way to calculate this.
function baseMetric(move: Move): number {
  const fam = move.family;
  if (
    (isCharUppercase(fam[0]) && fam[fam.length - 1] === "v") ||
    fam === "x" ||
    fam === "y" ||
    fam === "z" ||
    fam === "T"
  ) {
    return 0;
  } else {
    return 1;
  }
}

function etmMetric(_move: Move): number {
  return 1;
}

// TODO: Implement a puzzle-specific way to calculate this.
function rangeBlockTurnMetric(move: Move): number {
  const fam = move.family;
  if (
    (isCharUppercase(fam[0]) && fam[fam.length - 1] === "v") ||
    fam === "x" ||
    fam === "y" ||
    fam === "z" ||
    fam === "T"
  ) {
    return 0;
  } else {
    return 1;
  }
}

// TODO: Implement a puzzle-specific way to calculate this.
function quantumMetric(move: Move): number {
  return Math.abs(move.amount) * rangeBlockTurnMetric(move);
}

export const countMoves = functionFromTraversal(CountMoves, [baseMetric]);
export const countMovesETM = functionFromTraversal(CountMoves, [etmMetric]);
export const countRangeBlockQuantumMovesPG = functionFromTraversal(CountMoves, [
  quantumMetric,
]);
export const countRangeBlockMovesPG = functionFromTraversal(CountMoves, [
  rangeBlockTurnMetric,
]);

export const countLeavesInExpansionForSimultaneousMoveIndexer =
  functionFromTraversal(CountLeavesInExpansionForSimultaneousMoveIndexer, []);

/**
 * Only implemented so far:
 *
 * - 3x3x3: OBTM, RBTM, ETM
 */
export function countMetricMoves(
  puzzleLoader: PuzzleLoader,
  metric: CommonMetric,
  alg: Alg,
): number {
  if (puzzleLoader.id === "3x3x3") {
    if (metric in costFactorsByMetric) {
      return functionFromTraversal(CountMoves, [
        (move: Move) => countMove3x3x3(metric, move),
      ])(alg);
    }
  } else {
    switch (metric) {
      case CommonMetric.ExecutionTurnMetric:
        return countMovesETM(alg);
      case CommonMetric.RangeBlockTurnMetric: {
        if (puzzleLoader.pg) {
          return countRangeBlockMovesPG(alg);
        }
        break;
      }
      case CommonMetric.RangeBlockQuantumTurnMetric: {
        if (puzzleLoader.pg) {
          return countRangeBlockQuantumMovesPG(alg);
        }
        break;
      }
    }
  }
  throw new Error("Unsupported puzzle or metric.");
}
