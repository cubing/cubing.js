import { Alg } from "./Alg";
import { Move } from "./alg-nodes/leaves/Move";
import type { PuzzleSpecificAlgSimplificationInfo } from "./traversal";

function puzzleSpecificExperimentalAppendMove(
  alg: Alg,
  newMove: Move,
  options: {
    coalesce?: boolean; // defaults to false
    dontUndoSameDirectionFindABetterNameForThisLater?: boolean;
    puzzleSpecificAlgSimplificationInfo: PuzzleSpecificAlgSimplificationInfo;
  },
): Alg {
  const oldAlgNodes = Array.from(alg.childAlgNodes());
  let i;
  const quantumDirections = new Map<string, 1 | 0 | -1>();
  quantumDirections.set(
    newMove.quantum.toString(),
    Math.sign(newMove.amount) as -1 | 0 | 1,
  );
  for (i = oldAlgNodes.length - 1; i >= 0; i--) {
    const move = oldAlgNodes[i].as(Move);
    if (!move) {
      break;
    }
    if (
      !options.puzzleSpecificAlgSimplificationInfo.areQuantumMovesSameAxis!(
        move.quantum,
        newMove.quantum,
      )
    ) {
      break;
    }
    const quantumKey = move.quantum.toString();
    const existingQuantumDirectionOnAxis = quantumDirections.get(quantumKey);
    console.log(
      "*",
      quantumKey,
      move.toString(),
      existingQuantumDirectionOnAxis,
      Math.sign(move.amount),
      existingQuantumDirectionOnAxis !== Math.sign(move.amount),
      quantumDirections,
    );
    if (
      options?.dontUndoSameDirectionFindABetterNameForThisLater &&
      existingQuantumDirectionOnAxis &&
      existingQuantumDirectionOnAxis !== Math.sign(move.amount)
    ) {
      break;
    }
    quantumDirections.set(quantumKey, Math.sign(move.amount) as -1 | 0 | 1);
  }
  const axisMoves = [...(oldAlgNodes.splice(i + 1) as Move[]), newMove];
  console.log(oldAlgNodes, axisMoves);
  const simplifiedAxisMoves = options.puzzleSpecificAlgSimplificationInfo
    .simplifySameAxisMoves!(axisMoves);
  return new Alg([...oldAlgNodes, ...simplifiedAxisMoves]);
}

// puzzleSpecificExperimentalAppendMove(new Alg("R U L x"), new Move("R'"), {
//   puzzleSpecificAlgSimplificationInfo:
//     cube3x3x3.puzzleSpecificAlgSimplificationInfo!,
// }).log();

// puzzleSpecificExperimentalAppendMove(new Alg("R U R' x"), new Move("M'"), {
//   puzzleSpecificAlgSimplificationInfo:
//     cube3x3x3.puzzleSpecificAlgSimplificationInfo!,
// }).log();

export function experimentalAppendMove(
  alg: Alg,
  newMove: Move,
  options?: {
    coalesce?: boolean; // defaults to false
    puzzleSpecificAlgSimplificationInfo?: PuzzleSpecificAlgSimplificationInfo;
  },
): Alg {
  if (
    options?.coalesce &&
    options?.puzzleSpecificAlgSimplificationInfo?.areQuantumMovesSameAxis &&
    options?.puzzleSpecificAlgSimplificationInfo?.doQuantumMovesCommute &&
    options?.puzzleSpecificAlgSimplificationInfo?.simplifySameAxisMoves
  ) {
    // TODO: avoid `as any`
    return puzzleSpecificExperimentalAppendMove(alg, newMove, options as any);
  }

  const oldAlgNodes = Array.from(alg.childAlgNodes());
  const oldLastMove = oldAlgNodes[oldAlgNodes.length - 1] as Move | undefined;
  if (
    options?.coalesce &&
    oldLastMove &&
    oldLastMove.quantum &&
    oldLastMove.quantum.isIdentical(newMove.quantum)
  ) {
    const newAlgNodes = oldAlgNodes.slice(0, oldAlgNodes.length - 1);
    let newAmount = oldLastMove.amount + newMove.amount;
    const mod =
      options?.puzzleSpecificAlgSimplificationInfo?.quantumMoveOrder?.(
        newMove.quantum,
      );
    if (mod) {
      newAmount = ((newAmount % mod) + mod) % mod;
      if (newAmount * 2 > mod) {
        newAmount -= mod;
      }
    }
    if (newAmount !== 0) {
      newAlgNodes.push(oldLastMove.modified({ amount: newAmount }));
    }
    return new Alg(newAlgNodes);
  } else {
    return new Alg([...oldAlgNodes, newMove]);
  }
}
