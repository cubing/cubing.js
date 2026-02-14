import { LazyPromise } from "../../../../../../vendor/first-party/LazyPromise/LazyPromise";

export const dynamicMasterTetraminxSolver = new LazyPromise(
  () => import("./search-dynamic-solve-master_tetraminx"),
);
