import { LazyPromise } from "@cubing/lazy-promise";

export const searchDynamicSideEvents = new LazyPromise(
  () => import("./search-dynamic-sgs-side-events"),
);
