import { from } from "../../../../../../vendor/mit/p-lazy/p-lazy";

export const dynamicKilominxSolver = from<
  typeof import("./search-dynamic-solve-kilominx")
>(() => import("./search-dynamic-solve-kilominx"));
