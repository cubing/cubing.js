import { customBuild } from "../custom-build/index.js";

// const SITES_ROOT = "src/sit/ "dist/sites/alpha.twizzle.net";

// customBuild({
//   root: "src/sites/",
//   outDir: "dist/dev/sites",
//   dev: true,
// });

customBuild({
  srcRoot: "sites",
  dev: true,
});
