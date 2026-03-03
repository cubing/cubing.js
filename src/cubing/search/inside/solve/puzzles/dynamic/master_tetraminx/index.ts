import { LazyPromise } from "@cubing/lazy-promise";

export const dynamicMasterTetraminxSolver = new LazyPromise(
  () => import("./search-dynamic-solve-master_tetraminx"),
);
