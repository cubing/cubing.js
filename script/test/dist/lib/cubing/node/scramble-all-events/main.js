import { fileURLToPath } from "node:url";
import { needPath } from "../../../../../../lib/needPath.js";

needPath(
  fileURLToPath(
    new URL("../../../../../../../dist/lib/cubing/scramble", import.meta.url),
  ),
  "make build-lib-js",
);

await import("./test.js");
