import { preInitialize222, random222Scramble } from "../implementations/2x2x2";
import { initialize333, random333Scramble } from "../implementations/3x3x3";
import { initialize444, random444Scramble } from "../implementations/4x4x4";

const DEBUG_MEASURE_PERF = true;

function now() {
  return (typeof performance === "undefined" ? Date : performance).now();
}

async function measurePerf<T>(
  name: string,
  f: () => T | Promise<T>
): Promise<T> {
  if (!DEBUG_MEASURE_PERF) {
    return f();
  }

  const start = now();
  const result = f();
  if ((result as any)?.then) {
    await result;
  }
  const end = now();
  console.warn(`${name}: ${Math.round(end - start)}ms`);
  return result;
}

export const insideAPI = {
  initialize: async (eventID: string) => {
    switch (eventID) {
      case "222":
        return measurePerf("preInitialize222", preInitialize222);
      case "333":
      case "333oh":
      case "333ft":
        return measurePerf("initialize333", initialize333);
      case "444":
        return measurePerf("initialize444", initialize444);
      default:
        throw new Error(`unsupported event: ${eventID}`);
    }
  },

  randomScramble: async (eventID: string) => {
    switch (eventID) {
      case "222":
        return measurePerf("random222Scramble", random222Scramble);
      case "333":
      case "333oh":
      case "333ft":
        return measurePerf("random333Scramble", random333Scramble);
      case "444":
        return measurePerf("random444Scramble", random444Scramble);
      default:
        throw new Error(`unsupported event: ${eventID}`);
    }
  },
};
