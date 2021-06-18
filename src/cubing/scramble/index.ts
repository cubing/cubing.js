import { Alg } from "../alg";
import type { PuzzleLoader } from "../puzzles";

export async function scramble(puzzle: PuzzleLoader): Promise<Alg> {
  console.log(puzzle);
  return new Alg("R U R'");
}
