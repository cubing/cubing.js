import { barelyServeSite } from "./barelyServeSite.ts";

await barelyServeSite(
  "sites/experiments.cubing.net/cubing.js",
  /* dev */ false,
);
