import { KPuzzle, KPuzzleDefinition } from "../../kpuzzle";

export function lazyKPuzzle(
  getDef: () => Promise<KPuzzleDefinition>,
): () => Promise<KPuzzle> {
  let cachedKPuzzlePromise: Promise<KPuzzle> | null = null;
  const getKPuzzle = async () => {
    const kpuzzle = new KPuzzle(await getDef());
    return kpuzzle;
  };
  return (): Promise<KPuzzle> => {
    return (cachedKPuzzlePromise ??= getKPuzzle());
  };
}
