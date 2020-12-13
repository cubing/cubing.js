import {
  BlockMove,
  Comment,
  Commutator,
  Conjugate,
  Group,
  invert,
  NewLine,
  Pause,
  Sequence,
  TraversalUp,
} from "../../../../alg";
import { MillisecondTimestamp } from "../../cursor/CursorTypes";
import { defaultDurationForAmount } from "../AlgDuration";

export interface LocalMoveWithRange {
  move: BlockMove;
  msUntilNext: MillisecondTimestamp;
  duration: MillisecondTimestamp;
}

export interface MoveWithRange {
  move: BlockMove;
  start: MillisecondTimestamp;
  end: MillisecondTimestamp;
}

const axisLookup: Record<string, "x" | "y" | "z"> = {
  u: "y",
  l: "x",
  f: "z",
  r: "x",
  b: "z",
  d: "y",
  m: "x",
  e: "y",
  s: "z",
  x: "x",
  y: "y",
  z: "z",
};

function isSameAxis(move1: BlockMove, move2: BlockMove): boolean {
  return (
    axisLookup[move1.family[0].toLowerCase()] ===
    axisLookup[move2.family[0].toLowerCase()]
  );
}

// TODO: Replace this with an optimized implementation.
// TODO: Consider `(x U)` and `(U x F)` to be simultaneous.
export class LocalSimulMoves extends TraversalUp<LocalMoveWithRange[]> {
  public traverseSequence(sequence: Sequence): LocalMoveWithRange[] {
    const processed: LocalMoveWithRange[][] = [];
    for (const nestedUnit of sequence.nestedUnits) {
      processed.push(this.traverse(nestedUnit));
    }
    return Array.prototype.concat(...processed);
  }

  public traverseGroupOnce(sequence: Sequence): LocalMoveWithRange[] {
    if (sequence.nestedUnits.length === 0) {
      return [];
    }

    for (const unit of sequence.nestedUnits) {
      if (unit.type !== "blockMove")
        // TODO: define the type statically on the class?
        return this.traverse(sequence);
    }

    const blockMoves = sequence.nestedUnits as BlockMove[];
    let maxSimulDur = defaultDurationForAmount(blockMoves[0].amount);
    for (let i = 0; i < blockMoves.length - 1; i++) {
      for (let j = 1; j < blockMoves.length; j++) {
        if (!isSameAxis(blockMoves[i], blockMoves[j])) {
          return this.traverse(sequence);
        }
      }
      maxSimulDur = Math.max(
        maxSimulDur,
        defaultDurationForAmount(blockMoves[i].amount),
      );
    }

    const localMovesWithRange: LocalMoveWithRange[] = blockMoves.map(
      (blockMove): LocalMoveWithRange => {
        return {
          move: blockMove,
          msUntilNext: 0,
          duration: maxSimulDur,
        };
      },
    );
    localMovesWithRange[
      localMovesWithRange.length - 1
    ].msUntilNext = maxSimulDur;
    return localMovesWithRange;
  }

  public traverseGroup(group: Group): LocalMoveWithRange[] {
    const processed: LocalMoveWithRange[][] = [];

    const segmentOnce: Sequence =
      group.amount > 0 ? group.nestedSequence : invert(group.nestedSequence);
    for (let i = 0; i < Math.abs(group.amount); i++) {
      processed.push(this.traverseGroupOnce(segmentOnce));
    }
    return Array.prototype.concat(...processed);
  }

  public traverseBlockMove(blockMove: BlockMove): LocalMoveWithRange[] {
    const duration = defaultDurationForAmount(blockMove.amount);
    return [
      {
        move: blockMove,
        msUntilNext: duration,
        duration,
      },
    ];
  }

  public traverseCommutator(commutator: Commutator): LocalMoveWithRange[] {
    const processed: LocalMoveWithRange[][] = [];
    const segmentsOnce: Sequence[] =
      commutator.amount > 0
        ? [
            commutator.A,
            commutator.B,
            invert(commutator.A),
            invert(commutator.B),
          ]
        : [
            commutator.B,
            commutator.A,
            invert(commutator.B),
            invert(commutator.A),
          ];
    for (let i = 0; i < Math.abs(commutator.amount); i++) {
      for (const segment of segmentsOnce) {
        processed.push(this.traverseGroupOnce(segment));
      }
    }
    return Array.prototype.concat(...processed);
  }

  public traverseConjugate(conjugate: Conjugate): LocalMoveWithRange[] {
    const processed: LocalMoveWithRange[][] = [];
    const segmentsOnce: Sequence[] =
      conjugate.amount > 0
        ? [conjugate.A, conjugate.B, invert(conjugate.A)]
        : [conjugate.A, invert(conjugate.B), invert(conjugate.A)];
    for (let i = 0; i < Math.abs(conjugate.amount); i++) {
      for (const segment of segmentsOnce) {
        processed.push(this.traverseGroupOnce(segment));
      }
    }
    return Array.prototype.concat(...processed);
  }

  public traversePause(_pause: Pause): LocalMoveWithRange[] {
    return [];
  }

  public traverseNewLine(_newLine: NewLine): LocalMoveWithRange[] {
    return [];
  }

  public traverseComment(_comment: Comment): LocalMoveWithRange[] {
    return [];
  }
}

const localSimulMovesInstance = new LocalSimulMoves();

const localSimulMoves = localSimulMovesInstance.traverseSequence.bind(
  localSimulMovesInstance,
) as (a: Sequence) => LocalMoveWithRange[];

export function simulMoves(a: Sequence): MoveWithRange[] {
  let timestamp = 0;
  const l = localSimulMoves(a).map(
    (localSimulMove: LocalMoveWithRange): MoveWithRange => {
      const moveWithRange = {
        move: localSimulMove.move,
        start: timestamp,
        end: timestamp + localSimulMove.duration,
      };
      timestamp += localSimulMove.msUntilNext;
      return moveWithRange;
    },
  );
  return l;
}
