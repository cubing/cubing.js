import { needFolder } from "../../../../lib/need-folder.js";

needFolder(
  new URL("../../../../../dist/cubing/scramble", import.meta.url).pathname,
  "make build-esm",
);

import("./test.js");
