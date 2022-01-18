import { Alg, AlgBuilder } from "../../../../../alg";
import { puzzles } from "../../../../../puzzles";
import { mustBeInsideWorker } from "../../../inside-worker";
import { addOrientationSuffix } from "../../addOrientationSuffix";
import { randomChoiceFactory } from "../../../../../vendor/random-uint-below";
import { toMin2PhaseState } from "./convert";
import { passesFilter } from "./filter";
import { sgs3x3x3 } from "./legacy-sgs";
import type { KTransformation } from "../../../../../kpuzzle";

export async function random333State(): Promise<KTransformation> {
  const kpuzzle = await puzzles["3x3x3"].kpuzzle();
  let transformation = kpuzzle.identityTransformation();
  for (const piece of sgs3x3x3) {
    transformation = transformation.applyAlg(
      Alg.fromString(((await randomChoiceFactory()) as any)(piece)),
    );
  }
  if (!passesFilter(kpuzzle, transformation)) {
    return random333State();
  }
  return transformation;
}

let cachedImport: Promise<
  typeof import("../../../../../vendor/min2phase/gwt")
> | null = null;
function dynamicMin2phaseGWT(): Promise<
  typeof import("../../../../../vendor/min2phase/gwt")
> {
  return (cachedImport ??= import("../../../../../vendor/min2phase/gwt"));
}

export async function solve333(s: KTransformation): Promise<Alg> {
  mustBeInsideWorker();
  return Alg.fromString(
    (await dynamicMin2phaseGWT()).solveState(toMin2PhaseState(s)),
  );
}

export async function random333Scramble(): Promise<Alg> {
  return solve333(await random333State());
}

export async function initialize333(): Promise<void> {
  (await dynamicMin2phaseGWT()).initialize();
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
