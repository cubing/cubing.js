export { randomChoiceFactory } from "./random-choice";
export { randomUIntBelowFactory } from "./random-int";

// TODO: reuse factory properly, move this to a separate file, add to impl.
import { randomUIntBelowFactory } from "./random-int";
const randomUIntBelowPromise = randomUIntBelowFactory();
export async function randomPermute<T>(list: T[]): Promise<void> {
  for (let i=1; i < list.length; i++) {
    const j = (await randomUIntBelowPromise)(i);
    [list[i], list[j]] = [list[j], list[i]]
  }
}
