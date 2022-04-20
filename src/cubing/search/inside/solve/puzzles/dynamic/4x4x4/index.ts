import { from } from "../../../../../../vendor/p-lazy/p-lazy";

export const dynamic4x4x4Solver = from<
  typeof import("./search-dynamic-4x4x4-solver")
>(() => import("./search-dynamic-4x4x4-solver"));
