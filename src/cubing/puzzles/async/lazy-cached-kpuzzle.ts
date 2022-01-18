import { KPuzzle, KPuzzleDefinition } from "../../kpuzzle";
import { PLazy } from "../../vendor/p-lazy/p-lazy";

export function lazyKPuzzle(
  getDef: () => Promise<KPuzzleDefinition>,
): () => Promise<KPuzzle> {
  const getKPuzzle = async () => {
    return new KPuzzle(await getDef());
  };
  const lazy = new PLazy<KPuzzle>(getKPuzzle) as Promise<KPuzzle>;
  return () => lazy;
}
