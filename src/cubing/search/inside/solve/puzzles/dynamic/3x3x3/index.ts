import { LazyPromise } from "@cubing/lazy-promise";

export const dynamic3x3x3min2phase = new LazyPromise(
  () => import("./search-dynamic-solve-3x3x3"),
);
