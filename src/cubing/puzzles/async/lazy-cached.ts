export function getCached<T>(getValue: () => Promise<T>): () => Promise<T> {
  let cachedPromise: Promise<T> | null = null;
  return (): Promise<T> => {
    return (cachedPromise ??= getValue());
  };
}
