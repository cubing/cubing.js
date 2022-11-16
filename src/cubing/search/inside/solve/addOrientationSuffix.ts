import { Alg, AlgBuilder, Move } from "../../../alg";
import { randomChoice } from "random-uint-below";

export function addOrientationSuffix(
  alg: Alg,
  suffixSpec: (null | string)[][],
): Alg {
  const algBuilder = new AlgBuilder();
  algBuilder.experimentalPushAlg(alg);
  for (const suffix of suffixSpec) {
    const choice = randomChoice(suffix);
    if (choice !== null) {
      algBuilder.push(Move.fromString(choice));
    }
  }
  return algBuilder.toAlg();
}
