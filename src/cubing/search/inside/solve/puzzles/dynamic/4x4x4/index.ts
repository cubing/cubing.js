import { LazyPromise } from "@cubing/lazy-promise";

export const dynamic4x4x4Solver = new LazyPromise(
  () => import("./search-dynamic-solve-4x4x4"),
);
