import { Alg } from "../Alg";
import type { AlgNode } from "../alg-nodes";
import type { AlgLeaf } from "../alg-nodes/AlgNode";
import { Move } from "../alg-nodes/leaves/Move";
import { type AppendOptions, AppendOptionsHelper } from "./options";

function areSameDirection(direction: -1 | 1, move2: Move): boolean {
  // This multiplication has two properties:
  // - If either amount is 0, returns true.
  // - Otherwise, the signs have to match.
  return direction * Math.sign(move2.amount) >= 0;
}

export function offsetMod(
  x: number,
  positiveMod: number,
  offset: number = 0,
): number {
  return ((((x - offset) % positiveMod) + positiveMod) % positiveMod) + offset;
}

export function experimentalAppendMove(
  alg: Alg,
  addedMove: Move,
  options?: AppendOptions,
): Alg {
  const optionsHelper = new AppendOptionsHelper(options);

  const outputPrefix: AlgNode[] = Array.from(alg.childAlgNodes());
  let outputSuffix: Move[] = [addedMove];
  function output() {
    return new Alg([...outputPrefix, ...outputSuffix]); // TODO: What's the most efficient way to do this?
  }

  function modMove(move: Move): Move {
    if (optionsHelper.cancelPuzzleSpecificModWrap() === "none") {
      return move;
    }
    const quantumMoveOrder =
      optionsHelper.puzzleSpecificSimplifyOptions()?.quantumMoveOrder;
    if (!quantumMoveOrder) {
      return move;
    }
    const mod = quantumMoveOrder(addedMove.quantum)!; // TODO: throw if `undefined`?
    let offset: number;
    switch (optionsHelper.cancelPuzzleSpecificModWrap()) {
      case "gravity": {
        offset = -Math.floor((mod - (move.amount < 0 ? 0 : 1)) / 2); // TODO: dedup this calculation for the most common path?
        break;
      }
      case "canonical-centered": {
        offset = -Math.floor((mod - 1) / 2); // TODO: dedup this calculation for the most common path?
        break;
      }
      case "canonical-positive": {
        offset = 0;
        break;
      }
      case "preserve-sign": {
        offset = move.amount < 0 ? 1 - mod : 0;
        break;
      }
      default: {
        throw new Error("Unknown mod wrap");
      }
    }
    const offsetAmount = offsetMod(move.amount, mod, offset);
    return move.modified({ amount: offsetAmount });
  }

  if (optionsHelper.cancelAny()) {
    let canCancelMoveBasedOnQuantum: (move: Move) => boolean;
    const axis = optionsHelper.puzzleSpecificSimplifyOptions()?.axis;
    if (axis) {
      canCancelMoveBasedOnQuantum = (move: Move): boolean =>
        axis.areQuantumMovesSameAxis(addedMove.quantum, move.quantum);
    } else {
      const newMoveQuantumString = addedMove.quantum.toString();
      canCancelMoveBasedOnQuantum = (move: Move): boolean =>
        move.quantum.toString() === newMoveQuantumString;
    }

    const sameDirectionOnly =
      optionsHelper.cancelQuantum() === "same-direction";

    const quantumDirections = new Map<string, 1 | 0 | -1>();
    quantumDirections.set(
      addedMove.quantum.toString(),
      Math.sign(addedMove.amount) as -1 | 0 | 1,
    );
    let i: number;
    for (i = outputPrefix.length - 1; i >= 0; i--) {
      const move = outputPrefix[i].as(Move);
      if (!move) {
        break;
      }
      if (!canCancelMoveBasedOnQuantum(move)) {
        break;
      }
      const quantumKey = move.quantum.toString();
      if (sameDirectionOnly) {
        const existingQuantumDirectionOnAxis =
          quantumDirections.get(quantumKey);
        if (
          existingQuantumDirectionOnAxis && // Short-circuits, but that's actually okay here.
          !areSameDirection(existingQuantumDirectionOnAxis, move)
        ) {
          break;
        }
        quantumDirections.set(quantumKey, Math.sign(move.amount) as -1 | 0 | 1);
      }
    }
    const suffix = [...(outputPrefix.splice(i + 1) as Move[]), addedMove];

    if (axis) {
      // TODO: pass down quantum mod
      outputSuffix = axis.simplifySameAxisMoves(
        suffix,
        optionsHelper.cancelPuzzleSpecificModWrap() !== "none",
      );
    } else {
      const amount = suffix.reduce(
        (sum: number, move: Move) => sum + move.amount,
        0,
      );
      if (quantumDirections.size !== 1) {
        throw new Error(
          "Internal error: multiple quantums when one was expected",
        );
      }
      outputSuffix = [new Move(addedMove.quantum, amount)];
    }
  }
  outputSuffix = outputSuffix
    .map((m) => modMove(m))
    .filter((move: Move) => move.amount !== 0);
  return output();
}

export function experimentalAppendNode(
  alg: Alg,
  leaf: AlgLeaf,
  options: AppendOptions,
): Alg {
  const maybeMove = leaf.as(Move);
  if (maybeMove) {
    return experimentalAppendMove(alg, maybeMove, options);
  } else {
    return new Alg([...alg.childAlgNodes(), leaf]);
  }
}
