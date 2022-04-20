import { from } from "../../../../../../vendor/p-lazy/p-lazy";

export const dynamicKilominxSolver = from<
  typeof import("./search-dynamic-kilominx-solver")
>(() => import("./search-dynamic-kilominx-solver"));
