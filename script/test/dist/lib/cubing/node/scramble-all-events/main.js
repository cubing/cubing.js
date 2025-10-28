import { Path } from "path-class";
import { needPath } from "../../../../../../lib/needPath.js";

needPath(
  Path.resolve(
    "../../../../../../../dist/lib/cubing/scramble",
    import.meta.url,
  ),
  "make build-lib-js",
);

await import("./test.js");
