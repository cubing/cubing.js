import { needFolder } from "../../../../lib/need-folder.js";

needFolder(
  new URL("../../../../../dist/esm/alg", import.meta.url).pathname,
  "make build-esm",
);

import("./test.js");
