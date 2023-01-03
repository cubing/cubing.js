import { from } from "../../../../../../vendor/mit/p-lazy/p-lazy";

export const dynamicMasterTetraminxSolver = from<
  typeof import("./search-dynamic-solve-master_tetraminx")
>(() => import("./search-dynamic-solve-master_tetraminx"));
