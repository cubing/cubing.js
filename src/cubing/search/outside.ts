import { Alg } from "../alg";
import type { KPuzzle } from "../kpuzzle";
// import { preInitialize222 } from "../implementations/2x2x2";
import type { KPattern } from "../kpuzzle/KPattern";
import type { PrefetchLevel, WorkerAPI } from "./inside/api";
import type { TwipsOptions } from "./inside/solve/twips";
import { allWorkerAPIPromises, instantiateWorkerAPI } from "./instantiator";

let cachedWorkerInstance: Promise<WorkerAPI> | undefined;
function getCachedWorkerInstance(): Promise<WorkerAPI> {
  return (cachedWorkerInstance ??= instantiateWorkerAPI());
}

export async function mapToAllWorkers(
  f: (worker: WorkerAPI) => void,
): Promise<void> {
  await Promise.all(
    allWorkerAPIPromises.map(async (worker) => {
      f(await worker);
    }),
  );
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
    case "333oh":
      _preInitializationHintForEvent("333");
      return;
  }
  void (async () => {
    await (await getCachedWorkerInstance()).initialize(eventID);
  })();
}

export async function randomScrambleForEvent(eventID: string): Promise<Alg> {
  const worker = searchOutsideDebugGlobals.forceNewWorkerForEveryScramble
    ? await instantiateWorkerAPI()
    : await getCachedWorkerInstance();
  const scrambleString = await worker.randomScrambleStringForEvent(eventID);

  return Alg.fromString(scrambleString);
}

export async function deriveScrambleForEvent(
  derivationSeedHex: string,
  derivationSaltHierarchy: string[],
  eventID: string,
): Promise<Alg> {
  if (!searchOutsideDebugGlobals.allowDerivedScrambles) {
    throw new Error("Derived scrambles are not allowed.");
  }
  const worker = searchOutsideDebugGlobals.forceNewWorkerForEveryScramble
    ? await instantiateWorkerAPI()
    : await getCachedWorkerInstance();
  const scrambleString = await worker.deriveScrambleStringForEvent(
    derivationSeedHex,
    derivationSaltHierarchy,
    eventID,
  );
  return Alg.fromString(scrambleString);
}

export async function experimentalSolve3x3x3IgnoringCenters(
  pattern: KPattern,
): Promise<Alg> {
  const cwi = await getCachedWorkerInstance();
  return Alg.fromString(await cwi.solve333ToString(pattern.patternData));
}

export async function experimentalSolve2x2x2(pattern: KPattern): Promise<Alg> {
  const cwi = await getCachedWorkerInstance();
  return Alg.fromString(await cwi.solve222ToString(pattern.patternData));
}

export async function solveSkewb(pattern: KPattern): Promise<Alg> {
  const cwi = await getCachedWorkerInstance();
  return Alg.fromString(await cwi.solveSkewbToString(pattern.patternData));
}

export async function solvePyraminx(pattern: KPattern): Promise<Alg> {
  const cwi = await getCachedWorkerInstance();
  return Alg.fromString(await cwi.solvePyraminxToString(pattern.patternData));
}

export async function solveMegaminx(pattern: KPattern): Promise<Alg> {
  const cwi = await getCachedWorkerInstance();
  return Alg.fromString(await cwi.solveMegaminxToString(pattern.patternData));
}

export interface SolveTwipsOptions {
  generatorMoves?: string[];
  targetPattern?: KPattern;
  minDepth?: number;
  maxDepth?: number;
}

export async function solveTwips(
  kpuzzle: KPuzzle,
  pattern: KPattern,
  options?: SolveTwipsOptions,
): Promise<Alg> {
  const { targetPattern, ...otherOptions } = options ?? {};
  const apiOptions: TwipsOptions = otherOptions;
  if (targetPattern) {
    apiOptions.targetPattern = targetPattern.patternData;
  }
  const { ...def } = kpuzzle.definition;
  delete def.experimentalIsPatternSolved;
  // delete def.derivedMoves;
  const dedicatedWorker = await instantiateWorkerAPI();
  try {
    return Alg.fromString(
      // TODO: unnecessary because we terminate the worker?
      await dedicatedWorker.solveTwipsToString(
        def,
        pattern.patternData,
        apiOptions,
      ),
    );
  } finally {
    console.log("Search ended, terminating dedicated `twips` worker.");
    // TODO: support re-using the same worker for multiple searches..
    // dedicatedWorker.terminate?.(); // TODO
  }
}

interface SearchOutsideDebugGlobals {
  logPerf: boolean;
  scramblePrefetchLevel: `${PrefetchLevel}`;
  forceNewWorkerForEveryScramble: boolean;
  showWorkerInstantiationWarnings: boolean;
  // This can prevent a request to `search-worker-entry.js` when it doesn't exist, if the library semantics have been mangled by `esbuild`.
  prioritizeEsbuildWorkaroundForWorkerInstantiation: boolean;
  allowDerivedScrambles: boolean;
}

export const searchOutsideDebugGlobals: SearchOutsideDebugGlobals = {
  logPerf: true,
  scramblePrefetchLevel: "auto",
  forceNewWorkerForEveryScramble: false,
  showWorkerInstantiationWarnings: true,
  prioritizeEsbuildWorkaroundForWorkerInstantiation: false,
  allowDerivedScrambles: false,
};

export function setSearchDebug(
  options: Partial<SearchOutsideDebugGlobals>,
): void {
  const { logPerf, scramblePrefetchLevel } = options;
  if (typeof logPerf !== "undefined") {
    searchOutsideDebugGlobals.logPerf = logPerf;
    void mapToAllWorkers((worker) => worker.setDebugMeasurePerf(logPerf));
  }
  if (typeof scramblePrefetchLevel !== "undefined") {
    searchOutsideDebugGlobals.scramblePrefetchLevel = scramblePrefetchLevel;
    void mapToAllWorkers((worker) =>
      worker.setScramblePrefetchLevel(scramblePrefetchLevel as PrefetchLevel),
    );
  }
  for (const booleanField of [
    "forceNewWorkerForEveryScramble",
    "showWorkerInstantiationWarnings",
    "prioritizeEsbuildWorkaroundForWorkerInstantiation",
    "allowDerivedScrambles",
  ] as const) {
    if (booleanField in options) {
      searchOutsideDebugGlobals[booleanField] =
        options[booleanField] ?? searchOutsideDebugGlobals[booleanField];
    }
  }
}
