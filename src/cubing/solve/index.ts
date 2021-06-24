import { Alg } from "../alg";
import type { Transformation } from "../kpuzzle";
import type { PuzzleLoader } from "../puzzles";

export async function solve(
  puzzle: PuzzleLoader,
  state: Transformation,
): Promise<Alg> {
  console.log(puzzle, state);
  return new Alg("F2 D2");
}

export { randomScrambleForEvent } from "./worker";
