import type { Move, QuantumMove } from "../alg-nodes";

// TODO: enums?
export type QuantumDirectionCancellation =
  | "any-direction" // Cancel any moves with the same quantum.
  | "same-direction" // Cancel two quantums when have non-zero amounts of the same sign (positive/negative). An amount of 0 always counts as the same direction as any other amount.
  | "none";
export type ModWrap = "centered" | "none" | "positive" | "preserve-sign";

export interface AppendOptionsConfig {
  cancel?: {
    quantum?: QuantumDirectionCancellation; // default: "any-direction"
    puzzleSpecificModWrap?: ModWrap; // default: "centered"
  };
  puzzleSpecificAlgSimplifyInfo?: PuzzleSpecificAlgSimplifyInfo;
}

export class AppendOptions {
  constructor(public config: AppendOptionsConfig = {}) {}

  cancelQuantum(): QuantumDirectionCancellation {
    return this.config.cancel?.quantum ?? "any-direction";
  }

  cancelAny() {
    return this.cancelQuantum() !== "none";
  }

  cancelPuzzleSpecificModWrap(): ModWrap {
    return this.config.cancel?.puzzleSpecificModWrap ?? "centered";
  }
}

export interface SimplifyOptions {
  collapseMoves?: boolean;
  puzzleSpecificAlgSimplifyInfo?: PuzzleSpecificAlgSimplifyInfo;
  depth?: number | null; // TODO: test
}

export interface PuzzleSpecificAxisSimplifyInfo {
  // All moves on the same axis *must* commute.
  areQuantumMovesSameAxis: (
    quantumMove1: QuantumMove,
    quantumMove2: QuantumMove,
  ) => boolean;
  simplifySameAxisMoves: (moves: Move[]) => Move[];
}

// TOOD: allow "normal" "twisty" puzzles to hardcode axis concepts without hardcoding too much in `Alg` that's not relevant to all puzzles.
export interface PuzzleSpecificAlgSimplifyInfo {
  quantumMoveOrder: (quantumMove: QuantumMove) => number;
  // TODO: implement cancellation for non-axis commuting moves (e.g. Megaminx: `BL R BL'` → `R`)
  // // Commutation is not transitive. For example, on Megaminx: BR and BL both commute with F, but not with each other.
  // doQuantumMovesCommute?: (
  //   quantumMove1: QuantumMove,
  //   quantumMove2: QuantumMove,
  // ) => boolean;
  axis?: PuzzleSpecificAxisSimplifyInfo;
}
