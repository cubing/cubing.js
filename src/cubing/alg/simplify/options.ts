import type { Move, QuantumMove } from "../alg-nodes";

// TODO: enums?
export type QuantumDirectionCancellation =  "any-direction" | "same-direction" | "none";
export type ModWrap = "centered" | "none" ; // TODO: "positive" | "preserve-sign"
  
export interface AppendOptions {
  cancel?: {
    quantum?: QuantumDirectionCancellation; // default: "any-direction"
    puzzleSpecificModWrap: ModWrap // default: "centered"
  };
  puzzleSpecificAlgSimplifyInfo: PuzzleSpecificAlgSimplifyInfo;
}

export function getAppendOptionsCancelQuantum(appendOptions?: AppendOptions): QuantumDirectionCancellation {
  return appendOptions?.cancel?.quantum ?? "any-direction"
}

export function getAppendOptionsPuzzleSpecificModeWrap(appendOptions?: AppendOptions): ModWrap {
  return appendOptions?.cancel?.puzzleSpecificModWrap ?? "centered"
}

export interface SimplifyOptions {
  collapseMoves?: boolean;
  puzzleSpecificAlgSimplifyInfo?: PuzzleSpecificAlgSimplifyInfo;
  depth?: number | null; // TODO: test
}

// TOOD: allow "normal" "twisty" puzzles to hardcode axis concepts without hardcoding too much in `Alg` that's not relevant to all puzzles.
export interface PuzzleSpecificAlgSimplifyInfo {
  quantumMoveOrder?: (quantumMove: QuantumMove) => number;
  // Commutation is not transitive. For example, on Megaminx: BR and BL both commute with F, but not with each other.
  doQuantumMovesCommute?: (
    quantumMove1: QuantumMove,
    quantumMove2: QuantumMove,
  ) => boolean;
  // All moves on the same axis *must* commute.
  areQuantumMovesSameAxis?: (
    quantumMove1: QuantumMove,
    quantumMove2: QuantumMove,
  ) => boolean;
  simplifySameAxisMoves?: (moves: Move[]) => Move[];
}
