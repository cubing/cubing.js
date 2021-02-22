import { Move } from "../../../alg";
import { PuzzleWrapper, State } from "../../3D/puzzles/KPuzzleWrapper";
import { Duration, PuzzlePosition, Timestamp } from "../cursor/CursorTypes";

// // TODO: Include Pause, include amounts
// class CountAnimatedMoves extends TraversalUp<number, number> {
//   public traverseSequence(sequence: Alg): number {
//     let total = 0;
//     for (const part of sequence.childUnits()) {
//       total += this.traverseUnit(part);
//     }
//     return total;
//   }

//   public traverseGroup(bunch: Bunch): number {
//     return (
//       this.traverseAlg(bunch.experimentalAlg) *
//       Math.abs(bunch.experimentalEffectiveAmount)
//     );
//   }

//   public traverseBlockMove(_blockMove: Move): number {
//     return 1;
//   }

//   public traverseCommutator(commutator: Commutator): number {
//     return (
//       2 *
//       (this.traverseSequence(commutator.A) +
//         this.traverseSequence(commutator.B))
//     );
//   }

//   public traverseConjugate(conjugate: Conjugate): number {
//     return (
//       2 * this.traverseSequence(conjugate.A) +
//       this.traverseSequence(conjugate.B)
//     );
//   }

//   public traversePause(_pause: Pause): number {
//     return 0;
//   }

//   public traverseNewLine(_newLine: Newline): number {
//     return 0;
//   }

//   public traverseComment(_comment: Comment): number {
//     return 0;
//   }
// }

export interface AlgIndexer<P extends PuzzleWrapper> {
  getMove(index: number): Move | null;
  indexToMoveStartTimestamp(index: number): Timestamp;
  stateAtIndex(index: number, startTransformation?: State<P>): State<P>;
  transformAtIndex(index: number): State<P>;
  numMoves(): number;
  timestampToIndex(timestamp: Timestamp): number;
  algDuration(): Duration;
  moveDuration(index: number): number;
  timestampToPosition?: (
    timestamp: Timestamp,
    startTransformation?: State<P>,
  ) => PuzzlePosition;
}

// const countAnimatedMovesInstance = new CountAnimatedMoves();
// export const countAnimatedMoves = countAnimatedMovesInstance.traverse.bind(
//   countAnimatedMovesInstance,
// );
