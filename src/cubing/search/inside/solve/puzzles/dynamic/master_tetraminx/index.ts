import { from } from "../../../../../../vendor/p-lazy/p-lazy";

export const dynamic4x4x4Solver = from<
  typeof import("./search-dynamic-master_tetraminx-solver")
>(() => import("./search-dynamic-master_tetraminx-solver"));
