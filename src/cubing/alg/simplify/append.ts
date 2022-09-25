import { off } from "process";
import { cube3x3x3 } from "../../puzzles";
import { puzzleSpecificAlgSimplifyInfo333 } from "../../puzzles/implementations/3x3x3/puzzle-specific-simplifications";
import { Alg } from "../Alg";
import type { AlgNode } from "../alg-nodes";
import { Move } from "../alg-nodes/leaves/Move";
import { AppendOptions, AppendOptionsConfig } from "./options";

function areSameDirection(amount1: number, move2: Move): boolean {
  // This multiplication has two properties:
  // - If either amount is 0, returns true.
  // - Otherwise, the signs have to match.
  return amount1 * Math.sign(move2.amount) !== -1;
}

function offsetMod(x: number, positiveMod: number, offset: number): number {
  return ((((x - offset) % positiveMod) + positiveMod) % positiveMod) + offset;
}

export function experimentalAppendMove(
  alg: Alg,
  addedMove: Move,
  optionsConfig?: AppendOptionsConfig,
): Alg {
  const options = new AppendOptions(optionsConfig);

  let outputPrefix: AlgNode[] = Array.from(alg.childAlgNodes());
  let outputSuffix: Move[] = [addedMove];
  function output() {
    return new Alg([...outputPrefix, ...outputSuffix]); // TODO: What's the most efficient way to do this?
  }
  if (!options.cancelAny()) {
    return output();
  }

  let canCancelMoveBasedOnQuantum: (move: Move) => boolean;
  const axis = options.config.puzzleSpecificAlgSimplifyInfo?.axis;
  if (axis) {
    canCancelMoveBasedOnQuantum = (move: Move): boolean =>
      axis.areQuantumMovesSameAxis(addedMove.quantum, move.quantum);
  } else {
    const newMoveQuantumString = addedMove.quantum.toString();
    canCancelMoveBasedOnQuantum = (move: Move): boolean =>
      move.quantum.toString() === newMoveQuantumString;
  }

  const sameDirectionOnly = options.cancelQuantum() === "same-direction";

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
      const existingQuantumDirectionOnAxis = quantumDirections.get(quantumKey);
      if (
        existingQuantumDirectionOnAxis &&
        areSameDirection(existingQuantumDirectionOnAxis, move)
      ) {
        break;
      }
    }
    quantumDirections.set(quantumKey, Math.sign(move.amount) as -1 | 0 | 1);
  }
  const suffix = [...(outputPrefix.splice(i + 1) as Move[]), addedMove];
  if (axis) {
    // TODO: quantum mod
    outputSuffix = axis.simplifySameAxisMoves(suffix);
  } else {
    console.log("s", ...suffix.map((m) => m.toString()));
    let amount = suffix.reduce(
      (sum: number, move: Move) => sum + move.amount,
      0,
    );
    if (quantumDirections.size !== 1) {
      throw new Error(
        "Internal error: multiple quantums when one was expected",
      );
    }
    let move = new Move(addedMove.quantum, amount);
    move.log("move");
    if (options.cancelPuzzleSpecificModWrap() !== "none") {
      const quantumMoveOrder =
        options.config.puzzleSpecificAlgSimplifyInfo?.quantumMoveOrder;
      if (quantumMoveOrder) {
        const mod = quantumMoveOrder(addedMove.quantum)!; // TODO: throw if `undefined`?
        let offset: number;
        switch (options.cancelPuzzleSpecificModWrap()) {
          case "centered": {
            offset = -Math.floor((mod - 1) / 2);
            break;
          }
          case "positive": {
            offset = 0;
            break;
          }
          case "preserve-sign": {
            offset = amount < 0 ? 1 - mod : 0;
            break;
          }
          default: {
            throw new Error("Unknown mod wrap");
          }
        }
        console.log(amount, mod, offset);
        let offsetAmount = offsetMod(amount, mod, offset);
        move = move.modified({ amount: offsetAmount });
      }
    }
    outputSuffix = amount === 0 ? [] : [move];
  }
  return output();
}

// console.log(offsetMod(-3, 4, -1));
// console.log(offsetMod(-4, 4, -1));
// console.log(offsetMod(-5, 4, -1));
// console.log(offsetMod(-6, 4, -1));

for (const puzzleSpecificModWrap of [
  "none",
  "centered",
  "positive",
  "preserve-sign",
] as const) {
  experimentalAppendMove(new Alg("R U R"), new Move("R7'"), {
    cancel: {
      puzzleSpecificModWrap,
    },
    puzzleSpecificAlgSimplifyInfo: {
      quantumMoveOrder: () => 4,
    },
  }).log(puzzleSpecificModWrap);
}

puzzleSpecificAlgSimplifyInfo333;

experimentalAppendMove(new Alg("x M"), new Move("R'"), {
  cancel: {
    puzzleSpecificModWrap: "centered",
  },
  puzzleSpecificAlgSimplifyInfo: puzzleSpecificAlgSimplifyInfo333,
}).log();
// new Alg(
//   simplifySameAxisMoves(["r", "M'", "M'"].map((s) => Move.fromString(s))),
// ).log();
// // globalThis.process?.exit(0);

// simplifySameAxisMoves(["x", "M", "R'"].map((s) => Move.fromString(s)))[0]
//   .log();

// // simplifySameAxisMoves(["R", "M'", "L'"].map((s) => Move.fromString(s)));
// // simplifySameAxisMoves(["x", "L"].map((s) => Move.fromString(s)));
// // simplifySameAxisMoves(["L2", "R2'", "x2"].map((s) => Move.fromString(s)));

// new Alg(simplifySameAxisMoves(["L", "L2"].map((s) => Move.fromString(s))))
//   .log();
// new Alg(
//   simplifySameAxisMoves(["l", "l6'"].map((s) => Move.fromString(s))),
// ).log();
// // new Alg(
// //   simplifySameAxisMoves(["r2", "r3"].map((s) => Move.fromString(s))),
// // ).log();

// simplifySameAxisMoves(["x", "R'"].map((s) => Move.fromString(s)))[0]
//   .log();
// simplifySameAxisMoves(["x", "L"].map((s) => Move.fromString(s)))[0].log();
// simplifySameAxisMoves(["x", "L", "R'"].map((s) => Move.fromString(s)))[0].log();
// simplifySameAxisMoves(["x", "L", "M"].map((s) => Move.fromString(s)))[0].log();
// simplifySameAxisMoves(["x", "R'", "M"].map((s) => Move.fromString(s)))[0].log();
// simplifySameAxisMoves(
//   ["L", "L", "x", "x"].map((s) => Move.fromString(s)),
// )[0].log();
