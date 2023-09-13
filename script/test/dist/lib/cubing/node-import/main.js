import { needPath } from "../../../../../lib/needPath.js";

needPath(
  new URL("../../../../../../dist/lib/cubing/alg", import.meta.url).pathname,
  "make build-lib-js",
);

import("./test.js");
