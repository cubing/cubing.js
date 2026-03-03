import { LazyPromise } from "@cubing/lazy-promise";

export const dynamicSq1Solver = new LazyPromise(
  () => import("./search-dynamic-solve-sq1"),
);
