import { Alg, AlgBuilder, Move } from "../../../alg";
import { randomChoiceFactory } from "../../../vendor/random-uint-below";

export async function addOrientationSuffix(
  alg: Alg,
  suffixSpec: (null | string)[][],
): Promise<Alg> {
  const algBuilder = new AlgBuilder();
  algBuilder.experimentalPushAlg(alg);
  for (const suffix of suffixSpec) {
    const choice = ((await randomChoiceFactory()) as any)(suffix);
    if (choice !== null) {
      algBuilder.push(Move.fromString(choice));
    }
  }
  return algBuilder.toAlg();
}
