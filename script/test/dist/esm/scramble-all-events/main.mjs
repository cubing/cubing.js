import { needFolder } from "../../../../lib/need-folder.js";

needFolder(
  new URL("../../../../../dist/esm/scramble", import.meta.url).pathname,
  "make build-esm",
);

import("./test.mjs");
