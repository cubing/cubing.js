import { KPuzzle, KPuzzleDefinition } from "../../kpuzzle";

// TODO
export function lazyKPuzzle(
  getKPuzzle: () => Promise<KPuzzle>,
): () => Promise<KPuzzle> {
  let cachedKPuzzlePromise: Promise<KPuzzle> | null = null;
  return (): Promise<KPuzzle> => {
    return (cachedKPuzzlePromise ??= getKPuzzle());
  };
}

// TODO
export function lazyKPuzzleFromDef(
  getDef: () => Promise<KPuzzleDefinition>,
): () => Promise<KPuzzle> {
  return lazyKPuzzle(async () => new KPuzzle(await getDef()));
}
