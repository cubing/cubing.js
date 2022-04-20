import { from } from "../../../../../../vendor/p-lazy/p-lazy";

export const dynamicMasterTetraminxSolver = from<
  typeof import("./search-dynamic-master_tetraminx-solver")
>(() => import("./search-dynamic-master_tetraminx-solver"));
