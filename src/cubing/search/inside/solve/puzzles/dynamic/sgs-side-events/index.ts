import { LazyPromise } from "../../../../../../vendor/first-party/LazyPromise/LazyPromise";

export const searchDynamicSideEvents = new LazyPromise(
  () => import("./search-dynamic-sgs-side-events"),
);
