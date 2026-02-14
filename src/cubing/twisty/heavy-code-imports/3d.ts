// TODO can we remove the cached proxy?

import { LazyPromise } from "../../vendor/first-party/LazyPromise/LazyPromise";

export const bulk3DCode = new LazyPromise(
  () => import("./dynamic-entries/twisty-dynamic-3d"),
);
