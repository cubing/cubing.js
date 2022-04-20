import { from } from "../../../../../../vendor/p-lazy/p-lazy";

export const searchDynamicUnofficial = from<
  typeof import("./search-dynamic-sgs-unofficial")
>(() => import("./search-dynamic-sgs-unofficial"));
