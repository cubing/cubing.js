import { restartEsbuild } from "./esbuild.js";
import { CustomServer } from "./server.js";

const SITES_ROOT = "src/sites";
const ESBUILD_OUTPUT_ROOT = "dist/dev/esbuild";

/*
We have had serious issues with bugs in bundlers, and are rolling our own dev
server as a thin layer on `esbuild` in watch mode. We: 

- Enumerate all the `.ts` files in `SITES_ROOT` and start `esbuild`:
  - in watch mode
  - with those `.ts` files as entry points
  - building to `ESBUILD_OUTPUT_ROOT`.
- Start a server with two roots:
  - Serve from `ESBUILD_OUTPUT_ROOT` if possible.
  - Else serve from `src/sites`

This works well enough, but it has a few consequences:
- Since we don't transform our HTML, we have to use `.js` for our script `src` attributes.
  - To make development easier, we put the corresponding `.ts` path as an `href` attribute.
 */

restartEsbuild(SITES_ROOT, ESBUILD_OUTPUT_ROOT);
new CustomServer({
  rootPaths: [ESBUILD_OUTPUT_ROOT, SITES_ROOT],
  port: 3333,
  // debug: true,
}).start();

// TODO: Restart `esbuild` when a JS file is missing (in case it was just created)?
