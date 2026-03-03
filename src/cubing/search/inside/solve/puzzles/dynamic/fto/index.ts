import { LazyPromise } from "@cubing/lazy-promise";

export const dynamicFTO = new LazyPromise(
  () => import("./search-dynamic-solve-fto"),
);
