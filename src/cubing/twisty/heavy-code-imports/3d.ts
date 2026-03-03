// TODO can we remove the cached proxy?

import { LazyPromise } from "@cubing/lazy-promise";

export const bulk3DCode = new LazyPromise(
  () => import("./dynamic-entries/twisty-dynamic-3d"),
);
