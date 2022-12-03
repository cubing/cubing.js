import { Alg } from "../alg";
import type { KPuzzle } from "../kpuzzle";
// import { preInitialize222 } from "../implementations/2x2x2";
import type { KState } from "../kpuzzle/KState";
import type { PrefetchLevel } from "./inside/api";
import { randomClockScrambleString } from "./inside/solve/puzzles/clock"; // TODO: don't reach into `inside` code.
import { randomMegaminxScrambleString } from "./inside/solve/puzzles/wca-minx"; // TODO: don't reach into `inside` code.
import type { TwsearchOptions } from "./inside/solve/twsearch";
import {
  InsideOutsideAPI,
  instantiateWorker,
  mapToAllWorkers,
} from "./instantiator";

let cachedWorkerInstance: Promise<InsideOutsideAPI> | null = null;
async function getCachedWorkerInstance(): Promise<InsideOutsideAPI> {
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
    await (await getCachedWorkerInstance()).insideAPI.initialize(eventID);
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
  if (searchOutsideDebugGlobals.forceNewWorkerForEveryScramble) {
  }
  const worker = searchOutsideDebugGlobals.forceNewWorkerForEveryScramble
    ? await instantiateWorker()
    : await getCachedWorkerInstance();
  return worker.insideAPI.randomScrambleStringForEvent(eventID);
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
  state: KState,
): Promise<Alg> {
  const cwi = await getCachedWorkerInstance();
  return Alg.fromString(await cwi.insideAPI.solve333ToString(state.stateData));
}

export async function experimentalSolve2x2x2(state: KState): Promise<Alg> {
  const cwi = await getCachedWorkerInstance();
  return Alg.fromString(await cwi.insideAPI.solve222ToString(state.stateData));
}

export async function solveSkewb(state: KState): Promise<Alg> {
  const cwi = await getCachedWorkerInstance();
  return Alg.fromString(
    await cwi.insideAPI.solveSkewbToString(state.stateData),
  );
}

export async function solvePyraminx(state: KState): Promise<Alg> {
  const cwi = await getCachedWorkerInstance();
  return Alg.fromString(
    await cwi.insideAPI.solvePyraminxToString(state.stateData),
  );
}

export async function solveMegaminx(state: KState): Promise<Alg> {
  const cwi = await getCachedWorkerInstance();
  return Alg.fromString(
    await cwi.insideAPI.solveMegaminxToString(state.stateData),
  );
}

export async function solveTwsearch(
  kpuzzle: KPuzzle,
  state: KState,
  options?: { moveSubset?: string[]; startState?: KState; minDepth?: number },
): Promise<Alg> {
  const { startState, ...otherOptions } = options ?? {};
  const apiOptions: TwsearchOptions = otherOptions;
  if (startState) {
    apiOptions.startState =
      startState.experimentalToTransformation()!.transformationData;
  }
  const { ...def } = kpuzzle.definition;
  delete def.experimentalIsStateSolved;
  delete def.experimentalDerivedMoves;
  const dedicatedWorker = await instantiateWorker();
  try {
    return Alg.fromString(
      await dedicatedWorker.insideAPI.solveTwsearchToString(
        def,
        state.experimentalToTransformation()!.transformationData,
        apiOptions,
      ),
    );
  } finally {
    console.log("Search ended, terminating dedicated `twsearch` worker.");
    // TODO: support re-using the same worker for multiple searches..
    await dedicatedWorker.outsideAPI.terminate();
  }
}

interface SearchOutsideDebugGlobals {
  logPerf: boolean;
  scramblePrefetchLevel: `${PrefetchLevel}`;
  forceStringWorker: boolean;
  disableStringWorker: boolean;
  forceNewWorkerForEveryScramble: boolean;
}
export const searchOutsideDebugGlobals: SearchOutsideDebugGlobals = {
  logPerf: false,
  scramblePrefetchLevel: "auto",
  forceStringWorker: false,
  disableStringWorker: false,
  forceNewWorkerForEveryScramble: false,
};

export function setDebug(options: Partial<SearchOutsideDebugGlobals>): void {
  const { logPerf, scramblePrefetchLevel } = options;
  if (typeof logPerf !== "undefined") {
    searchOutsideDebugGlobals.logPerf = logPerf;
    mapToAllWorkers((worker) => worker.insideAPI.setDebugMeasurePerf(logPerf));
  }
  if (typeof scramblePrefetchLevel !== "undefined") {
    searchOutsideDebugGlobals.scramblePrefetchLevel = scramblePrefetchLevel;
    mapToAllWorkers((worker) =>
      worker.insideAPI.setScramblePrefetchLevel(
        scramblePrefetchLevel as PrefetchLevel,
      ),
    );
  }
  if ("forceStringWorker" in options) {
    searchOutsideDebugGlobals.forceStringWorker = !!options.forceStringWorker;
  }
  if ("disableStringWorker" in options) {
    searchOutsideDebugGlobals.disableStringWorker =
      !!options.disableStringWorker;
  }
  if ("forceNewWorkerForEveryScramble" in options) {
    searchOutsideDebugGlobals.forceNewWorkerForEveryScramble =
      !!options.forceNewWorkerForEveryScramble;
  }
}
