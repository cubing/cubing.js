import { LazyPromise } from "../../../../../../vendor/first-party/LazyPromise/LazyPromise";

export const searchDynamicUnofficial = new LazyPromise(
  () => import("./search-dynamic-sgs-unofficial"),
);
