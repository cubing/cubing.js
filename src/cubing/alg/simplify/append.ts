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

  function modMove(move: Move): Move {
    if (options.cancelPuzzleSpecificModWrap() === "none") {
      return move;
    }
    const quantumMoveOrder =
      options.config.puzzleSpecificAlgSimplifyInfo?.quantumMoveOrder;
    if (!quantumMoveOrder) {
      return move;
    }
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
        offset = move.amount < 0 ? 1 - mod : 0;
        break;
      }
      default: {
        throw new Error("Unknown mod wrap");
      }
    }
    let offsetAmount = offsetMod(move.amount, mod, offset);
    return move.modified({ amount: offsetAmount });
  }

  if (axis) {
    // TODO: pass down quantum mod
    outputSuffix = axis.simplifySameAxisMoves(suffix).map((m) => modMove(m));
  } else {
    let amount = suffix.reduce(
      (sum: number, move: Move) => sum + move.amount,
      0,
    );
    if (quantumDirections.size !== 1) {
      throw new Error(
        "Internal error: multiple quantums when one was expected",
      );
    }
    outputSuffix = [modMove(new Move(addedMove.quantum, amount))];
  }
  outputSuffix = outputSuffix.filter((move: Move) => move.amount !== 0);
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

function test(alg: string, newMove: string) {
  experimentalAppendMove(Alg.fromString(alg), Move.fromString(newMove), {
    puzzleSpecificAlgSimplifyInfo: puzzleSpecificAlgSimplifyInfo333,
  }).log();
}

test("x M", "R'");
test("r M'", "M'");
test("x M", "R'");
test("R M'", "L'");
test("x", "L");
test("L2 R2'", "x2");
test("L", "L2");
test("l", "l6'");
test("r2", "r3");
test("x", "R'");
test("x", "L");
test("x L", "R'");
test("x L", "M");
test("x R'", "M");
test("R'", "x");
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
