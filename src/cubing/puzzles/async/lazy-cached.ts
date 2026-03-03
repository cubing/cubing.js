import { LazyPromise } from "@cubing/lazy-promise";

export function getCached<T>(getValue: () => Promise<T>): () => Promise<T> {
  const lazyPromise = new LazyPromise(getValue);
  return () => lazyPromise;
}
