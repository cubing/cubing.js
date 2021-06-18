/** @ts-ignore */
import { algToString, Sequence } from "cubing/alg";
import { preInitialize222 } from "../implementations/2x2x2";
import { randomClockScrambleString } from "../implementations/clock";
import { randomMegaminxScrambleString } from "../implementations/minx";
import { getWorker } from "../worker/strategy/outside";
import type { WorkerInsideAPI } from "../worker/strategy/types";

let cachedWorkerInstance: Promise<WorkerInsideAPI> | null = null;
function getCachedWorkerInstance(): Promise<WorkerInsideAPI> {
  // We'd use `??=`, but that's not compatible with some older node versions.
  return (cachedWorkerInstance = cachedWorkerInstance
    ? cachedWorkerInstance
    : getWorker());
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
  eventID: string
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

export async function _randomScrambleForEvent(
  eventID: string
): Promise<Sequence> {
  return (await getCachedWorkerInstance()).randomScramble(eventID);
}

export async function randomScrambleStringForEvent(
  eventID: string
): Promise<string> {
  switch (eventID) {
    case "clock":
      return randomClockScrambleString();
    case "333oh":
      return randomScrambleStringForEvent("333");
    case "minx":
      return randomMegaminxScrambleString();
  }
  return algToString(await _randomScrambleForEvent(eventID));
}
