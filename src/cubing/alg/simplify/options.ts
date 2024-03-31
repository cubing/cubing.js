import type { Move, QuantumMove } from "../alg-nodes";

// TODO: enums?
const DEFAULT_DIRECTIONAL = "any-direction";
DEFAULT_DIRECTIONAL;
export type QuantumDirectionalCancellation =
  | typeof DEFAULT_DIRECTIONAL // Cancel any moves with the same quantum.
  | "same-direction" // Cancel two quantums when have non-zero amounts of the same sign (positive/negative). An amount of 0 always counts as the same direction as any other amount.
  | "none";

// Example input: `R7' . R6' . R5' . R6` on a cube.
export type ModWrap =
  | "none" // R7' . R6' . R5' . R6
  | "gravity" // R . R2' . R' . R2
  | "canonical-centered" // R . R2 . R' . R2
  | "canonical-positive" // R . R2 . R3 . R2
  | "preserve-sign"; // R3' . R2' . R' . R2

export interface AppendCancelOptions {
  directional?: QuantumDirectionalCancellation;
  puzzleSpecificModWrap?: ModWrap; // Default depends on `directional`
}

// TODO: preserve single moves even when amount is 0?
export interface AppendOptions {
  cancel?: boolean | AppendCancelOptions; // Set to `true` to use future-proof defaults.
  // Takes precedence over the direct `puzzleSpecificSimplifyOptions` field.
  puzzleLoader?: {
    puzzleSpecificSimplifyOptions?: PuzzleSpecificSimplifyOptions;
  };
  puzzleSpecificSimplifyOptions?: PuzzleSpecificSimplifyOptions;
}

export class AppendOptionsHelper {
  constructor(private config: AppendOptions = {}) {}

  cancelQuantum(): QuantumDirectionalCancellation {
    const { cancel } = this.config;
    if (cancel === true) {
      return DEFAULT_DIRECTIONAL;
    }
    if (cancel === false) {
      return "none";
    }
    return cancel?.directional ?? "none";
  }

  cancelAny() {
    return this.config.cancel && this.cancelQuantum() !== "none";
  }

  cancelPuzzleSpecificModWrap(): ModWrap {
    const { cancel } = this.config;
    if (cancel === true || cancel === false) {
      return "canonical-centered";
    }
    if (cancel?.puzzleSpecificModWrap) {
      return cancel?.puzzleSpecificModWrap;
    }
    return cancel?.directional === "same-direction"
      ? "preserve-sign"
      : "canonical-centered";
  }

  puzzleSpecificSimplifyOptions(): PuzzleSpecificSimplifyOptions | undefined {
    return (
      this.config.puzzleLoader?.puzzleSpecificSimplifyOptions ??
      this.config.puzzleSpecificSimplifyOptions
    );
  }
}

export interface SimplifyOptions extends AppendOptions {
  depth?: number | null; // TODO: test
}

export interface PuzzleSpecificAxisSimplifyInfo {
  // All moves on the same axis *must* commute.
  areQuantumMovesSameAxis: (
    quantumMove1: QuantumMove,
    quantumMove2: QuantumMove,
  ) => boolean;
  simplifySameAxisMoves: (moves: Move[], quantumMod: boolean) => Move[];
}

// TODO: allow "normal" "twisty" puzzles to hardcode axis concepts without hardcoding too much in `Alg` that's not relevant to all puzzles.
export interface PuzzleSpecificSimplifyOptions {
  quantumMoveOrder?: (quantumMove: QuantumMove) => number;
  // TODO: implement cancellation for non-axis commuting moves (e.g. Megaminx: `BL R BL'` → `R`)
  // // Commutation is not transitive. For example, on Megaminx: BR and BL both commute with F, but not with each other.
  // doQuantumMovesCommute?: (
  //   quantumMove1: QuantumMove,
  //   quantumMove2: QuantumMove,
  // ) => boolean;
  axis?: PuzzleSpecificAxisSimplifyInfo;
}
