import { LazyPromise } from "../../../../../../vendor/first-party/LazyPromise/LazyPromise";

export const dynamic3x3x3min2phase = new LazyPromise(
  () => import("./search-dynamic-solve-3x3x3"),
);
