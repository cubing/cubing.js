import { mirrorDirectories } from "mirror-directories";
import liveServer from "live-server";

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
