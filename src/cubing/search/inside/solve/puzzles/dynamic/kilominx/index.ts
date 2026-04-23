import { LazyPromise } from "@cubing/lazy-promise";

export const dynamicKilominxSolver = new LazyPromise<
  typeof import("./search-dynamic-solve-kilominx")
>(() => import("./search-dynamic-solve-kilominx"));
