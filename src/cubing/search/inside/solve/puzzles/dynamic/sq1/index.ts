import { from } from "../../../../../../vendor/p-lazy/p-lazy";

export const dynamicSq1Solver = from<
  typeof import("./search-dynamic-sq1-solver")
>(() => import("./search-dynamic-sq1-solver"));
