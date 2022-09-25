import type { Move, QuantumMove } from "../alg-nodes";

// TODO: enums?
export type QuantumDirectionCancellation =
  | "any-direction" // Cancel any moves with the same quantum.
  | "same-direction" // Cancel two quantums when have non-zero amounts of the same sign (positive/negative). An amount of 0 always counts as the same direction as any other amount.
  | "none";

// Example input: `R7' . R6' . R5' . R6` on a cube.
export type ModWrap =
  | "gravity" // R . R2' . R' . R2
  | "none"
  | "canonical-centered" // R . R2 . R' . R2
  | "canonical-positive" // R . R2 . R3 . R2
  | "preserve-sign"; // R3' . R2' . R' . R2

// TODO: preserve single moves?
export interface AppendOptions {
  cancel?: {
    quantum?: QuantumDirectionCancellation; // default: "any-direction"
    puzzleSpecificModWrap?: ModWrap; // default: "gravity"
  };
  puzzleSpecific?: PuzzleSpecificAppendOptions;
}

export class AppendOptionsHelper {
  constructor(public config: AppendOptions = {}) {}

  cancelQuantum(): QuantumDirectionCancellation {
    return this.config.cancel?.quantum ?? "any-direction";
  }

  cancelAny() {
    return this.cancelQuantum() !== "none";
  }

  cancelPuzzleSpecificModWrap(): ModWrap {
    return this.config.cancel?.puzzleSpecificModWrap ?? "gravity";
  }
}

export interface SimplifyOptions extends AppendOptions {
  depth?: number | null; // TODO: test
}

export interface PuzzleSpecificAxisAppendInfo {
  // All moves on the same axis *must* commute.
  areQuantumMovesSameAxis: (
    quantumMove1: QuantumMove,
    quantumMove2: QuantumMove,
  ) => boolean;
  simplifySameAxisMoves: (moves: Move[]) => Move[];
}

// TOOD: allow "normal" "twisty" puzzles to hardcode axis concepts without hardcoding too much in `Alg` that's not relevant to all puzzles.
export interface PuzzleSpecificAppendOptions {
  quantumMoveOrder: (quantumMove: QuantumMove) => number;
  // TODO: implement cancellation for non-axis commuting moves (e.g. Megaminx: `BL R BL'` → `R`)
  // // Commutation is not transitive. For example, on Megaminx: BR and BL both commute with F, but not with each other.
  // doQuantumMovesCommute?: (
  //   quantumMove1: QuantumMove,
  //   quantumMove2: QuantumMove,
  // ) => boolean;
  axis?: PuzzleSpecificAxisAppendInfo;
}
