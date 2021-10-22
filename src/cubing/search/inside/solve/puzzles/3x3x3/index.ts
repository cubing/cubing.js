import { Alg, AlgBuilder } from "../../../../../alg";
import { KPuzzle, Transformation } from "../../../../../kpuzzle";
import { puzzles } from "../../../../../puzzles";
import { mustBeInsideWorker } from "../../../inside-worker";
import { addOrientationSuffix } from "../../addOrientationSuffix";
import { initialize, solveState } from "../../vendor/min2phase/gwt";
import { randomChoiceFactory } from "../../vendor/random-uint-below";
import { toMin2PhaseState } from "./convert";
import { passesFilter } from "./filter";
import { sgs3x3x3 } from "./legacy-sgs";

export async function random333State(): Promise<Transformation> {
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

export async function solve333(s: Transformation): Promise<Alg> {
  mustBeInsideWorker();
  return Alg.fromString(solveState(toMin2PhaseState(s)));
}

export async function random333Scramble(): Promise<Alg> {
  return solve333(await random333State());
}

export async function initialize333(): Promise<void> {
  initialize();
}

const randomSuffixes = [
  [null, "Rw", "Rw2", "Rw'", "Fw", "Fw'"],
  [null, "Dw", "Dw2", "Dw'"],
];

export async function random333OrientedScramble(): Promise<Alg> {
  return addOrientationSuffix(await random333Scramble(), randomSuffixes);
}

const extraBit = new Alg("R' U' F");
export async function random333FewestMovesScramble(): Promise<Alg> {
  const algBuilder = new AlgBuilder();
  const unorientedScramble = await random333Scramble();
  algBuilder.experimentalPushAlg(extraBit);
  // TODO:Avoid cancellable moves.
  algBuilder.experimentalPushAlg(unorientedScramble);
  algBuilder.experimentalPushAlg(extraBit);
  return algBuilder.toAlg();
}
