// @ts-ignore https://github.com/developit/web-worker/issues/13
import { default as Worker } from "web-worker";
export {
  randomScrambleForEvent,
  _preInitializationHintForEvent,
} from "./outside";

const workers: Worker[] = [];

// TODO
export function terminateWorkers(): void {
  for (const worker of workers) {
    worker.terminate();
  }
}
