import { from } from "../../../../../../vendor/p-lazy/p-lazy";

export const searchDynamicSideEvents = from<
  typeof import("./search-dynamic-side-events")
>(() => import("./search-dynamic-side-events"));
