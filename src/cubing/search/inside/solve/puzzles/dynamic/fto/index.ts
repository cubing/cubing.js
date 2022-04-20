import { from } from "../../../../../../vendor/p-lazy/p-lazy";

export const dynamicFTOSolver = from<
  typeof import("./search-dynamic-fto-solver")
>(() => import("./search-dynamic-fto-solver"));
