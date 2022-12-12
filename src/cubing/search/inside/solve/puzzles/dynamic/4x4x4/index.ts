import { from } from "../../../../../../vendor/mit/p-lazy/p-lazy";

export const dynamic4x4x4Solver = from<
  typeof import("./search-dynamic-solve-4x4x4")
>(() => import("./search-dynamic-solve-4x4x4"));
