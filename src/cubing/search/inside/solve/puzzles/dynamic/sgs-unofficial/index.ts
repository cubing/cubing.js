import { LazyPromise } from "@cubing/lazy-promise";

export const searchDynamicUnofficial = new LazyPromise(
  () => import("./search-dynamic-sgs-unofficial"),
);
