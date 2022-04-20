import { from } from "../../../../../../vendor/p-lazy/p-lazy";

export const dynamicSq1Solver = from<
  typeof import("./search-dynamic-solve-sq1")
>(() => import("./search-dynamic-solve-sq1"));
