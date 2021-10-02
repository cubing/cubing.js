import { restartEsbuild } from "./esbuild.js";
import { CustomServer } from "./server.js";

const SITES_ROOT = "src/sites";
const ESBUILD_OUTPUT_ROOT = "dist/dev/esbuild";

/*
We have had serious issues with bugs in bundlers, and are rolling our own dev
server as a thin layer on `esbuild` in watch mode. We: 

- Enumerate all the `.ts` files in `src/sites` and start `esbuild`:
  - in watch mode
  - with those `.ts` files as entry points
  - building to `dist/dev/esbuild
 */

restartEsbuild(SITES_ROOT, ESBUILD_OUTPUT_ROOT);
new CustomServer({
  rootPaths: [ESBUILD_OUTPUT_ROOT, SITES_ROOT],
  port: 3333,
  // debug: true,
}).start();

// TODO: Restart `esbuild` when a JS file is missing (in case it was just created)?
