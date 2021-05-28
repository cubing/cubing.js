import {
  Alg,
  Commutator,
  Conjugate,
  Grouping,
  LineComment,
  Move,
  Newline,
  Pause,
  TraversalDownUp,
} from "../../alg";
import type { Parsed } from "../../alg/parse";
import type { LeafUnit } from "../../alg/units/Unit";

interface DataDown {
  idx: number;
  numMovesSofar: number;
}

interface DataUp {
  latestUnit: Parsed<LeafUnit>;
  numMovesInside: number;
}

// Returns the first move with starting char index <= the given index.
export class AlgTrackerStartCharSearch extends TraversalDownUp<
  DataDown,
  { unit: Parsed<LeafUnit>; numMovesSofar: number } | null
> {
  traverseAlg(alg: Alg, dataDown: DataDown): Parsed<LeafUnit> | null {
    let latest: Parsed<LeafUnit> | null = null;
    for (const unit of alg.units()) {
      const traversed = this.traverseUnit(unit, dataDown);
      if (traversed) {
        latest = traversed;
      } else {
        continue;
      }
    }
    return latest;
  }

  traverseGrouping(
    grouping: Grouping,
    dataDown: DataDown,
  ): Parsed<LeafUnit> | null {
    return this.traverseAlg(grouping.experimentalAlg, idx);
  }

  traverseMove(move: Move, dataDown: DataDown): Parsed<LeafUnit> | null {
    const asParsed = move as Parsed<Move>; // TODO: handle non-parsed?
    if (asParsed.startCharIndex <= idx) {
      return asParsed;
    }
    return null;
  }

  traverseCommutator(
    commutator: Commutator,
    idx: number,
  ): Parsed<LeafUnit> | null {
    return (
      this.traverseUnit(commutator.B, idx) ||
      this.traverseUnit(commutator.A, idx)
    );
  }

  traverseConjugate(
    conjugate: Conjugate,
    idx: number,
  ): Parsed<LeafUnit> | null {
    return (
      this.traverseUnit(conjugate.B, idx) || this.traverseUnit(conjugate.A, idx)
    );
  }

  traversePause(pause: Pause, dataDown: DataDown): Parsed<Pause> | null {
    const asParsed = pause as Parsed<Pause>; // TODO: handle non-parsed?
    if (asParsed.startCharIndex <= idx) {
      return asParsed;
    }
    return null;
  }

  traverseNewline(
    newline: Newline,
    dataDown: DataDown,
  ): Parsed<Newline> | null {
    const asParsed = newline as Parsed<Newline>; // TODO: handle non-parsed?
    if (asParsed.startCharIndex <= idx) {
      return asParsed;
    }
    return null;
  }

  traverseLineComment(
    comment: LineComment,
    idx: number,
  ): Parsed<LeafUnit> | null {
    const asParsed = comment as Parsed<LineComment>; // TODO: handle non-parsed?
    if (asParsed.startCharIndex <= idx) {
      return asParsed;
    }
    return null;
  }
}

const algTrackerStartCharSearchInstance = new AlgTrackerStartCharSearch();
export const algTrackerStartCharSearch = algTrackerStartCharSearchInstance.traverseAlg.bind(
  algTrackerStartCharSearchInstance,
) as (alg: Alg, dataDown: DataDown) => Generator<Parsed<LeafUnit> | null>;
