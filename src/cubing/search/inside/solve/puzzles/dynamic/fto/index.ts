import { from } from "../../../../../../vendor/mit/p-lazy/p-lazy";

export const dynamicFTOSolver = from<
  typeof import("./search-dynamic-solve-fto")
>(() => import("./search-dynamic-solve-fto"));
