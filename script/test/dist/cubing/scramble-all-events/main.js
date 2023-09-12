import { needFolder } from "../../../../lib/need-folder.js";

needFolder(
  new URL("../../../../../dist/npm/cubing/scramble", import.meta.url).pathname,
  "make build-esm",
);

import("./test.js");
