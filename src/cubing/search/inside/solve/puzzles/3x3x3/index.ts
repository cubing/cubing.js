import { randomChoice } from "random-uint-below";
import { Alg } from "../../../../../alg/index.ts";
import type { KPattern } from "../../../../../kpuzzle/KPattern.ts";
import { puzzles } from "../../../../../puzzles/index.ts";
import { mustBeInsideWorker } from "../../../inside-worker.ts";
import { addOrientationSuffix } from "../../addOrientationSuffix.ts";
import { dynamic3x3x3min2phase } from "../dynamic/3x3x3/index.ts";
import { toMin2PhasePattern } from "./convert.ts";
import { passesFilter } from "./filter.ts";
import { sgs3x3x3 } from "./legacy-sgs.ts";

export async function random333Pattern(): Promise<KPattern> {
  const kpuzzle = await puzzles["3x3x3"].kpuzzle();
  let pattern = kpuzzle.defaultPattern();
  for (const piece of sgs3x3x3) {
    pattern = pattern.applyAlg(Alg.fromString(randomChoice(piece)));
  }
  if (!passesFilter(kpuzzle, pattern)) {
    return random333Pattern();
  }
  return pattern;
}

export async function solve333(s: KPattern): Promise<Alg> {
  mustBeInsideWorker();
  return Alg.fromString(
    (await dynamic3x3x3min2phase).solvePattern(toMin2PhasePattern(s)),
  );
}

export async function random333Scramble(): Promise<Alg> {
  return solve333(await random333Pattern());
}

export async function initialize333(): Promise<void> {
  (await dynamic3x3x3min2phase).initialize();
}

const randomSuffixes = [
  [null, "Rw", "Rw2", "Rw'", "Fw", "Fw'"],
  [null, "Dw", "Dw2", "Dw'"],
];

export async function random333OrientedScramble(): Promise<Alg> {
  return addOrientationSuffix(await random333Scramble(), randomSuffixes);
}
