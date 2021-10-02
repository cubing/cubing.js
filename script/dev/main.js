import { mirrorDirectories } from "mirror-directories";
import liveServer from "live-server";

import "./esbuild.js";

mirrorDirectories([
  {
    srcDirs: ["src/sites/", "dist/dev/esbuild/"],
    destDirs: ["dist/dev/serve"],
    rename: true,
  },
]);

var params = {
  host: "localhost",
  port: 3333,
  root: "./dist/dev/serve",
  open: true,
  logLevel: 2,
};
liveServer.start(params);

// (async () => {
//   try {
//     const watcher = watch("src/sites", { recursive: true });
//     for await (const event of watcher) console.log(event);
//   } catch (err) {
//     if (err.name === "AbortError") return;
//     throw err;
//   }
// })();
