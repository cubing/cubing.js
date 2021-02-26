import {
  LineComment,
  Commutator,
  Conjugate,
  Pause,
  TraversalUp,
  Turn,
  Alg,
  Grouping,
  Newline,
} from "../../../../alg";
import { MillisecondTimestamp } from "../../cursor/CursorTypes";
import { defaultDurationForAmount } from "../AlgDuration";

export interface LocalTurnWithRange {
  turn: Turn;
  msUntilNext: MillisecondTimestamp;
  duration: MillisecondTimestamp;
}

export interface TurnWithRange {
  turn: Turn;
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

function isSameAxis(turn1: Turn, turn2: Turn): boolean {
  return (
    axisLookup[turn1.family[0].toLowerCase()] ===
    axisLookup[turn2.family[0].toLowerCase()]
  );
}

// TODO: Replace this with an optimized implementation.
// TODO: Consider `(x U)` and `(U x F)` to be simultaneous.
export class LocalSimulTurns extends TraversalUp<LocalTurnWithRange[]> {
  public traverseAlg(alg: Alg): LocalTurnWithRange[] {
    const processed: LocalTurnWithRange[][] = [];
    for (const nestedUnit of alg.units()) {
      processed.push(this.traverseUnit(nestedUnit));
    }
    return Array.prototype.concat(...processed);
  }

  public traverseGroupingOnce(alg: Alg): LocalTurnWithRange[] {
    if (alg.experimentalIsEmpty()) {
      return [];
    }

    for (const unit of alg.units()) {
      if (!unit.is(Turn))
        // TODO: define the type statically on the class?
        return this.traverseAlg(alg);
    }

    const turns = Array.from(alg.units()) as Turn[];
    let maxSimulDur = defaultDurationForAmount(turns[0].effectiveAmount);
    for (let i = 0; i < turns.length - 1; i++) {
      for (let j = 1; j < turns.length; j++) {
        if (!isSameAxis(turns[i], turns[j])) {
          return this.traverseAlg(alg);
        }
      }
      maxSimulDur = Math.max(
        maxSimulDur,
        defaultDurationForAmount(turns[i].effectiveAmount),
      );
    }

    const localTurnsWithRange: LocalTurnWithRange[] = turns.map(
      (blockTurn): LocalTurnWithRange => {
        return {
          turn: blockTurn,
          msUntilNext: 0,
          duration: maxSimulDur,
        };
      },
    );
    localTurnsWithRange[
      localTurnsWithRange.length - 1
    ].msUntilNext = maxSimulDur;
    return localTurnsWithRange;
  }

  public traverseGrouping(grouping: Grouping): LocalTurnWithRange[] {
    const processed: LocalTurnWithRange[][] = [];

    const segmentOnce: Alg =
      grouping.experimentalEffectiveAmount > 0
        ? grouping.experimentalAlg
        : grouping.experimentalAlg.inverse();
    for (let i = 0; i < Math.abs(grouping.experimentalEffectiveAmount); i++) {
      processed.push(this.traverseGroupingOnce(segmentOnce));
    }
    return Array.prototype.concat(...processed);
  }

  public traverseTurn(turn: Turn): LocalTurnWithRange[] {
    const duration = defaultDurationForAmount(turn.effectiveAmount);
    return [
      {
        turn: turn,
        msUntilNext: duration,
        duration,
      },
    ];
  }

  public traverseCommutator(commutator: Commutator): LocalTurnWithRange[] {
    const processed: LocalTurnWithRange[][] = [];
    const segmentsOnce: Alg[] =
      commutator.experimentalEffectiveAmount > 0
        ? [
            commutator.A,
            commutator.B,
            commutator.A.inverse(),
            commutator.B.inverse(),
          ]
        : [
            commutator.B,
            commutator.A,
            commutator.B.inverse(),
            commutator.A.inverse(),
          ];
    for (let i = 0; i < Math.abs(commutator.experimentalEffectiveAmount); i++) {
      for (const segment of segmentsOnce) {
        processed.push(this.traverseGroupingOnce(segment));
      }
    }
    return Array.prototype.concat(...processed);
  }

  public traverseConjugate(conjugate: Conjugate): LocalTurnWithRange[] {
    const processed: LocalTurnWithRange[][] = [];
    const segmentsOnce: Alg[] =
      conjugate.experimentalEffectiveAmount > 0
        ? [conjugate.A, conjugate.B, conjugate.A.inverse()]
        : [conjugate.A, conjugate.B.inverse(), conjugate.A.inverse()];
    for (let i = 0; i < Math.abs(conjugate.experimentalEffectiveAmount); i++) {
      for (const segment of segmentsOnce) {
        processed.push(this.traverseGroupingOnce(segment));
      }
    }
    return Array.prototype.concat(...processed);
  }

  public traversePause(_pause: Pause): LocalTurnWithRange[] {
    return [];
  }

  public traverseNewline(_newline: Newline): LocalTurnWithRange[] {
    return [];
  }

  public traverseLineComment(_comment: LineComment): LocalTurnWithRange[] {
    return [];
  }
}

const localSimulTurnsInstance = new LocalSimulTurns();

const localSimulTurns = localSimulTurnsInstance.traverseAlg.bind(
  localSimulTurnsInstance,
) as (a: Alg) => LocalTurnWithRange[];

export function simulTurns(a: Alg): TurnWithRange[] {
  let timestamp = 0;
  const l = localSimulTurns(a).map(
    (localSimulTurn: LocalTurnWithRange): TurnWithRange => {
      const turnWithRange = {
        turn: localSimulTurn.turn,
        start: timestamp,
        end: timestamp + localSimulTurn.duration,
      };
      timestamp += localSimulTurn.msUntilNext;
      return turnWithRange;
    },
  );
  return l;
}
