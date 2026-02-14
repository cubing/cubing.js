import { LazyPromise } from "../../../../../../vendor/first-party/LazyPromise/LazyPromise";

export const dynamicSq1Solver = new LazyPromise(
  () => import("./search-dynamic-solve-sq1"),
);
