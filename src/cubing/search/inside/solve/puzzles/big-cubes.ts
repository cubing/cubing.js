import { Alg, AlgBuilder, Move, QuantumMove } from "../../../../alg";
import {
  randomChoice,
  randomUIntBelow,
} from "../../../../vendor/random-uint-below";

function numMoves(n: number): number {
  switch (n) {
    case 5:
      return 60;
    case 6:
      return 80;
    default:
      return 100;
  }
}

const axesFaces = [
  ["U", "D"],
  ["L", "R"],
  ["F", "B"],
];
const axesMovesCache: Map<number, QuantumMove[][]> = new Map();
function cachedAxesMoves(n: number): QuantumMove[][] {
  const existing = axesMovesCache.get(n);
  if (existing) {
    return existing;
  }
  const axesMoves = [];
  for (const faces of axesFaces) {
    const axisMoveFamilies: QuantumMove[] = [];
    axesMoves.push(axisMoveFamilies);

    for (const face of faces) {
      axisMoveFamilies.push(new QuantumMove(face));
      if (n > 3) {
        axisMoveFamilies.push(new QuantumMove(`${face}w`));
      }
      for (let i = 3; i <= n / 2; i++) {
        axisMoveFamilies.push(new QuantumMove(`${face}w`, i));
      }
    }
  }
  axesMovesCache.set(n, axesMoves);
  return axesMoves;
}

// TODO: Document this algorithm and compare to TNoodle.
export async function bigCubeRandomMoves(n: number): Promise<Alg> {
  const axesMoves = cachedAxesMoves(n);

  const cachedNumMoves = numMoves(n);
  const algBuilder = new AlgBuilder();
  let currentAxisIdx = 0;
  const currentAxisQuantumMoves = new Set();
  while (algBuilder.experimentalNumAlgNodes() < cachedNumMoves) {
    const newAxisIdx = randomUIntBelow(3);
    if (newAxisIdx !== currentAxisIdx) {
      currentAxisQuantumMoves.clear();
    }
    currentAxisIdx = newAxisIdx;

    const quantumMove = randomChoice(axesMoves[currentAxisIdx]);
    const quantumMoveStr = quantumMove.toString();
    if (currentAxisQuantumMoves.has(quantumMoveStr)) {
      // Skip duplicates and resample with replacement.
      continue;
    }
    currentAxisQuantumMoves.add(quantumMoveStr);
    algBuilder.push(new Move(quantumMove, randomChoice([1, 2, -1])));
  }

  return algBuilder.toAlg();
}
