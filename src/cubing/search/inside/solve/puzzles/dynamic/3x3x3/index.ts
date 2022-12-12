import { from } from "../../../../../../vendor/mit/p-lazy/p-lazy";

export const dynamic3x3x3min2phase = from<
  typeof import("./search-dynamic-solve-3x3x3")
>(() => import("./search-dynamic-solve-3x3x3"));
