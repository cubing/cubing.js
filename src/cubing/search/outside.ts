import { Alg } from "../alg";
// import { preInitialize222 } from "../implementations/2x2x2";
import { randomClockScrambleString } from "./inside/solve/puzzles/clock"; // TODO: don't reach into `inside` code.
import { randomMegaminxScrambleString } from "./inside/solve/puzzles/wca-minx"; // TODO: don't reach into `inside` code.
import { instantiateWorker } from "./instantiator";
import type { WorkerInsideAPI } from "./inside/api";
import type { Transformation } from "../puzzle-geometry/interfaces";

let cachedWorkerInstance: Promise<WorkerInsideAPI> | null = null;
async function getCachedWorkerInstance(): Promise<WorkerInsideAPI> {
  return await (cachedWorkerInstance ??= instantiateWorker());
}

// Pre-initialize the scrambler for the given event. (Otherwise, an event is
// initialized the first time you ask for a scramble for that event.)
//
// Some typical numbers for a fast computer:
// - 3x3x3 initialization: 200ms
// - Each 3x3x3 scramble: 50ms
// - 4x4x4 initialization: 2500ms
// - Each 4x4x4 scramble: 300ms to 800ms
//
// It is safe to immediately call for a scramble
// any time after starting pre-initialization, or to call for them without
// pre-initializing. Pre-initializing essentially gives the scramble worker a
// head start in case a scramble doesn't get requested immediately.
//
// Note that events cannot be pre-initialized in parallel. Attempting to
// pre-initialize multiple events will initialize them consecutively. Scrambles
// for a given event cannot be computed while another event is being initialized.
export function _preInitializationHintForEvent(
  eventID: string,
  // callback?: () => void
): void {
  switch (eventID) {
    case "clock":
    case "minx":
      return;
    case "333oh":
      return _preInitializationHintForEvent("333");
  }
  (async () => {
    await (await getCachedWorkerInstance()).initialize(eventID);
  })();
}

export async function randomScrambleForEvent(eventID: string): Promise<Alg> {
  switch (eventID) {
    case "clock":
      return Alg.fromString(await randomClockScrambleString());
    case "minx":
      return Alg.fromString(await randomMegaminxScrambleString());
  }
  const prom = _randomScrambleStringForEvent(eventID);
  const wat = await prom;
  return Alg.fromString(wat);
}

export async function _randomScrambleStringForEvent(
  eventID: string,
): Promise<string> {
  const cwi = await getCachedWorkerInstance();
  return cwi.randomScrambleStringForEvent(eventID);
}

export async function randomScrambleStringForEvent(
  eventID: string,
): Promise<string> {
  switch (eventID) {
    case "clock":
      return randomClockScrambleString();
    case "minx":
      return randomMegaminxScrambleString();
  }
  return await _randomScrambleStringForEvent(eventID);
}

export async function experimentalSolve3x3x3IgnoringCenters(
  s: Transformation,
): Promise<Alg> {
  const cwi = await getCachedWorkerInstance();
  return Alg.fromString(await cwi.solve333ToString(s));
}

export async function experimentalSolve2x2x2(s: Transformation): Promise<Alg> {
  const cwi = await getCachedWorkerInstance();
  return Alg.fromString(await cwi.solve222ToString(s));
}

export async function solveSkewb(s: Transformation): Promise<Alg> {
  const cwi = await getCachedWorkerInstance();
  return Alg.fromString(await cwi.solveSkewbToString(s));
}

export async function solvePyraminx(s: Transformation): Promise<Alg> {
  const cwi = await getCachedWorkerInstance();
  return Alg.fromString(await cwi.solvePyraminxToString(s));
}

export async function solveMegaminx(s: Transformation): Promise<Alg> {
  const cwi = await getCachedWorkerInstance();
  return Alg.fromString(await cwi.solveMegaminxToString(s));
}
