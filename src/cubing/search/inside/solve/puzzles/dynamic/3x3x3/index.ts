import { from } from "../../../../../../vendor/p-lazy/p-lazy";

export const dynamic3x3x3min2phase = from<
  typeof import("./search-dynamic-3x3x3-min2phase")
>(() => import("./search-dynamic-3x3x3-min2phase"));
