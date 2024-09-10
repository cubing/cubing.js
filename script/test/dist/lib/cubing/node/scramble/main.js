import { fileURLToPath } from "node:url";
import { needPath } from "../../../../../../lib/needPath.js";

needPath(
  fileURLToPath(
    new URL("../../../../../../../dist/lib/cubing/alg", import.meta.url),
  ),
  "make build-lib-js",
);

import("./test.js");
