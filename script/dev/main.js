import { restartEsbuild } from "./esbuild.js";
import { CustomServer } from "./server.js";

restartEsbuild();
new CustomServer({
  rootPaths: ["dist/dev/esbuild", "src/sites"],
  port: 3333,
}).start();
