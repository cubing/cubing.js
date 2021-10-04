import { cp } from "fs/promises";
import { join } from "path";
import { restartEsbuild } from "./esbuild.js";
import { CustomServer } from "./server.js";

/*
We have had serious issues with bugs in bundlers, and are rolling our own dev
server as a thin layer on `esbuild` in watch mode. We: 

- Enumerate all the `.ts` files in `SITES_ROOT` and start `esbuild`:
  - in watch mode,
  - with those `.ts` files as entry points,
  - building to `ESBUILD_OUTPUT_ROOT`.
- Start a server with two roots:
  - Serve from `ESBUILD_OUTPUT_ROOT` if the file can be found there.
  - Else serve from `SITES_ROOT`

This works well enough, but it has a few inconveniences:

- You have the reload the browser manually to pick up `.ts` entry point files that were created after the server was started
- We don't use any caching.
  - TODO: We could cache based on `stat` modified time.
- Since we don't transform our HTML, we have to use `.js` for our script `src` attributes.
  - To make easy to "Follow link" in VSCode, we put the corresponding `.ts` path as an `href` attribute. This attribute is ignored by browsers.
- `esbuild` will not automatically pick up on new `.ts` entry points. You'll have to restart the server for that.
  - TODO: we could restart the `esbuild` server any time we get a request for a `.js` file that we don't know.

Benefits we've gotten from doing this, so far:

- Source maps are working again.
- Safe to deploy to any folder on a server (no absolute resource paths injected by bundlers).
- No `_snowpack` folder.
- We don't have to spend 20 seconds (out of 30 seconds) of `make sites` on `babylonjs` transpilation (even though we're barely using it).

 */

console.log(`Using the new custom dev server.
If you're having issues, run: make dev-snowpack
`);

function srcFolder(srcPath, dev) {
  return {
    root: join("src", srcPath),
    outDir: join(dev ? "dist/dev" : "dist", srcPath),
  };
}

export async function customBuild(options) {
  const dev = options.dev ?? false;
  const isWebsite = options?.isWebsite ?? false;
  if (!options.srcRoot) {
    throw new Error("Must specify `srcRoot`");
  }
  const { root, outDir } = srcFolder(options.srcRoot, dev);

  // await build(searchWorkerTarget, dev);
  restartEsbuild(root, outDir, dev);
  if (dev) {
    new CustomServer({
      rootPaths: [outDir, root],
      port: 3333,
      // debug: true,
    }).start();
  } else if (isWebsite) {
    // TODO: filter out `.ts` if they don't work for source maps?
    cp(root, outDir, { recursive: true });
  }
}
