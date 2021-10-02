import { restartEsbuild } from "./esbuild.js";
import { CustomServer } from "./server.js";

restartEsbuild();
new CustomServer({
  rootPaths: ["dist/dev/esbuild", "src/sites"],
  port: 3333,
}).start();

// TODO: Restart `esbuild` when a JS file is missing (in case it was just created)?
