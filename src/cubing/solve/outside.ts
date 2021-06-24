/** @ts-ignore */
import { Alg } from "../alg";
// import { preInitialize222 } from "../implementations/2x2x2";
import { randomClockScrambleString } from "./vendor/implementations/clock";
import { randomMegaminxScrambleString } from "./vendor/implementations/minx";
import { instantiateWorker } from "./instantiator";
import type { WorkerInsideAPI } from "./inside/api";

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
  console.log("randy");
  const prom = _randomScrambleStringForEvent(eventID);
  console.log("prom", prom);
  const wat = await prom;
  console.log("wat", wat);
  return Alg.fromString(wat);
}

export async function _randomScrambleStringForEvent(
  eventID: string,
): Promise<string> {
  const cwi = await getCachedWorkerInstance();
  console.log("cwi", cwi);
  return cwi.randomScrambleStringForEvent(eventID);
}

export async function randomScrambleStringForEvent(
  eventID: string,
): Promise<string> {
  switch (eventID) {
    case "clock":
      return randomClockScrambleString();
    case "333oh":
      return randomScrambleStringForEvent("333");
    case "minx":
      return randomMegaminxScrambleString();
  }
  return await _randomScrambleStringForEvent(eventID);
}
