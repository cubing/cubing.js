import { LazyPromise } from "../../vendor/first-party/LazyPromise/LazyPromise";

export function getCached<T>(getValue: () => Promise<T>): () => Promise<T> {
  const lazyPromise = new LazyPromise(getValue);
  return () => lazyPromise;
}
