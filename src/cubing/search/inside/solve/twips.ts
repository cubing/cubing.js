import { LazyPromise } from "@cubing/lazy-promise";
import type { Alg } from "../../../alg";
import type {
  KPattern,
  KPatternData,
  KPuzzleDefinition,
} from "../../../kpuzzle";

export const twipsPromise = new LazyPromise(
  async () => import("../../../vendor/mpl/twips"),
);

export interface TwipsOptions {
  // TODO: start prune depth?
  generatorMoves?: string[];
  targetPattern?: KPatternData;
  minDepth?: number;
  maxDepth?: number;
}

export async function wasmTwips(
  def: KPuzzleDefinition,
  pattern: KPattern,
  options?: TwipsOptions,
): Promise<Alg> {
  const { wasmTwips } = await twipsPromise;
  return wasmTwips(def, pattern, options);
}

export async function wasmRandomScrambleForEvent(
  eventID: string,
): Promise<Alg> {
  const { wasmRandomScrambleForEvent } = await twipsPromise;
  return wasmRandomScrambleForEvent(eventID);
}

export async function wasmDeriveScrambleForEvent(
  derivationSeedHex: string,
  derivationSaltHierarchy: string[],
  eventID: string,
): Promise<Alg> {
  const { wasmDeriveScrambleForEvent } = await twipsPromise;
  return wasmDeriveScrambleForEvent(
    derivationSeedHex,
    derivationSaltHierarchy,
    eventID,
  );
}
