// TODO: move this into the 3x3x3 puzzle loader.

import type { Move } from "../alg";
import { experimentalCube3x3x3KPuzzleDefinition } from "../puzzles/cubing-private";
import { CommonMetric } from "./commonMetrics";

enum MoveType {
  Rotation = "Rotation",
  Outer = "Outer",
  Inner = "Inner",
}

function uncachedMoveCount(moveQuantumString: string): MoveType {
  if (
    moveQuantumString.endsWith("v") ||
    ["x", "y", "z"].includes(moveQuantumString)
  ) {
    // Rv
    return MoveType.Rotation;
  }
  if (
    moveQuantumString.startsWith("2") ||
    ["M", "E", "S"].includes(moveQuantumString)
  ) {
    return MoveType.Inner;
  }
  return MoveType.Outer;
}

let cache: Record<string, MoveType> | undefined;
function getCache(): Record<string, MoveType> {
  if (cache) {
    return cache;
  }
  cache = {};
  const moveQuantumStrings = [
    ...Object.keys(experimentalCube3x3x3KPuzzleDefinition.moves),
    ...Object.keys(experimentalCube3x3x3KPuzzleDefinition.derivedMoves!),
  ];
  for (const moveQuantumString of moveQuantumStrings) {
    cache[moveQuantumString] = uncachedMoveCount(moveQuantumString);
  }
  return cache;
}

// Ancient wisdom: https://github.com/cubing/alg.js/blob/0599fad84d81b8d943ad3ea3e5dc191db8b6c157/alg.js#L638-L651
/**
 * A move with an amount of 0 always has 0 cost. Else, the cost is
 *
 * constantFactor + amountFactor * Math.abs(move.amount)
 *
 */
export const costFactorsByMetric: Partial<
  Record<
    CommonMetric,
    Record<
      MoveType,
      {
        constantFactor: number;
        amountFactor: number;
        zeroAmount: number;
      }
    >
  >
> = {
  // Note: these are hardcoded for 3x3x3. They will not automatically generalize to any other puzzles.
  [CommonMetric.OuterBlockTurnMetric]: {
    [MoveType.Rotation]: { constantFactor: 0, amountFactor: 0, zeroAmount: 0 },
    [MoveType.Outer]: { constantFactor: 1, amountFactor: 0, zeroAmount: 0 },
    [MoveType.Inner]: { constantFactor: 2, amountFactor: 0, zeroAmount: 0 },
  },
  [CommonMetric.RangeBlockTurnMetric]: {
    [MoveType.Rotation]: { constantFactor: 0, amountFactor: 0, zeroAmount: 0 },
    [MoveType.Outer]: { constantFactor: 1, amountFactor: 0, zeroAmount: 0 },
    [MoveType.Inner]: { constantFactor: 1, amountFactor: 0, zeroAmount: 0 },
  },
  [CommonMetric.OuterBlockQuantumTurnMetric]: {
    [MoveType.Rotation]: { constantFactor: 0, amountFactor: 0, zeroAmount: 0 },
    [MoveType.Outer]: { constantFactor: 0, amountFactor: 1, zeroAmount: 0 },
    [MoveType.Inner]: { constantFactor: 0, amountFactor: 2, zeroAmount: 0 },
  },
  [CommonMetric.RangeBlockQuantumTurnMetric]: {
    [MoveType.Rotation]: { constantFactor: 0, amountFactor: 0, zeroAmount: 0 },
    [MoveType.Outer]: { constantFactor: 0, amountFactor: 1, zeroAmount: 0 },
    [MoveType.Inner]: { constantFactor: 0, amountFactor: 1, zeroAmount: 0 },
  },
  [CommonMetric.ExecutionTurnMetric]: {
    [MoveType.Rotation]: { constantFactor: 1, amountFactor: 0, zeroAmount: 1 },
    [MoveType.Outer]: { constantFactor: 1, amountFactor: 0, zeroAmount: 1 },
    [MoveType.Inner]: { constantFactor: 1, amountFactor: 0, zeroAmount: 1 },
  },
};

export function countMove3x3x3(metric: CommonMetric, move: Move): number {
  const costFactors = costFactorsByMetric[metric];
  if (!costFactors) {
    throw new Error(`Invalid metric for 3x3x3: ${metric}`);
  }
  const cache = getCache();
  const moveQuantumString = move.quantum.toString();
  if (!(moveQuantumString in cache)) {
    throw new Error(`Invalid move for 3x3x3 ${metric}: ${moveQuantumString}`);
  }
  const costType = cache[moveQuantumString];
  const { constantFactor, amountFactor, zeroAmount } = costFactors[costType];
  if (move.amount === 0) {
    return zeroAmount;
  }
  return constantFactor + amountFactor * Math.abs(move.amount);
}
