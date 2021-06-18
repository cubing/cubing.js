import { Unit, Alg } from "../../../../../alg";
// @ts-ignore
import { KPuzzle, Transformation } from "../../../../../kpuzzle";
// @ts-ignore
import { puzzles } from "../../../../../puzzles";
import { randomChoiceFactory } from "../vendor/random-uint-below";
import { toMin2PhaseState } from "./convert";
import { passesFilter } from "./filter";
import { initialize, solveState } from "./min2phase/gwt";
import { sgs3x3x3 } from "./sgs";

async function random333State(): Promise<Transformation> {
  const def = await puzzles["3x3x3"].def();
  const kpuzzle = new KPuzzle(def);
  for (const piece of sgs3x3x3) {
    kpuzzle.applyAlg(
      Alg.fromString(((await randomChoiceFactory()) as any)(piece)),
    );
  }
  if (!passesFilter(def, kpuzzle.state)) {
    return random333State();
  }
  return kpuzzle.state;
}

async function solve333(s: Transformation): Promise<Alg> {
  return Alg.fromString(solveState(toMin2PhaseState(s)));
}

export async function random333Scramble(): Promise<Alg> {
  return solve333(await random333State());
}

const randomSuffixes = [
  ["", "Rw", "Rw2", "Rw'", "Fw", "Fw'"],
  ["", "Dw", "Rw2", "Dw'"],
];

export async function initialize333(): Promise<void> {
  initialize();
}

export async function random333OrientedScramble(): Promise<Alg> {
  const unorientedScramble = await random333Scramble();
  let moves: Unit[] = Array.from(unorientedScramble.units());
  for (const suffix of randomSuffixes) {
    moves = moves.concat(
      Alg.fromString(((await randomChoiceFactory()) as any)(suffix)),
    );
  }
  return new Alg(moves);
}
