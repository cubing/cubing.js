import type { Move, QuantumMove } from "../alg-nodes";

export interface AppendOptions {
  cancel?: {
    sameDirection?: boolean; // default: true
    oppositeDirection?: boolean; // default: true
  };
  puzzleSpecificAlgSimplifyInfo: PuzzleSpecificAlgSimplifyInfo;
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
