// @ts-ignore https://github.com/developit/web-worker/issues/13
import { default as Worker } from "web-worker";

const workers: Worker[] = [];

export function instantiate(): void {
  console.log("instantiating ing!!!!");
  console.log("Worker", Worker);
  console.log("import.meta.url", import.meta.url);
  const url = new URL(
    "./worker-inside-generated.cjs",
    import.meta.url,
  ).toString();
  console.log("url", url);
  workers.push(
    new Worker(url, {
      type: "classic",
    }),
  );
}

export function terminateWorkers(): void {
  for (const worker of workers) {
    worker.terminate();
  }
}

import {
  randomScrambleStringForEvent,
  _preInitializationHintForEvent,
} from "./vendor/entries/esm/scrambles";

export {
  randomScrambleStringForEvent,
  _preInitializationHintForEvent as experimentalPreInitializationHintForEvent,
};
