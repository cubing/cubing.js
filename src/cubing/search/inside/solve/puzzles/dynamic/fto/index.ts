import { LazyPromise } from "../../../../../../vendor/first-party/LazyPromise/LazyPromise";

export const dynamicFTO = new LazyPromise(
  () => import("./search-dynamic-solve-fto"),
);
