import { from } from "../../../../../../vendor/p-lazy/p-lazy";

export const searchDynamicUnofficial = from<
  typeof import("./search-dynamic-unofficial")
>(() => import("./search-dynamic-unofficial"));
