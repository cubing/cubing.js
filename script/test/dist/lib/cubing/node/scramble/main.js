import { Path } from "path-class";
import { needPath } from "../../../../../../lib/needPath.js";

needPath(
  Path.resolve("../../../../../../../dist/lib/cubing/alg", import.meta.url),
  "make build-lib-js",
);

import("./test.js");
