import { restartEsbuild } from "./esbuild.js";
import liveServer from "live-server";
import { watch } from "fs/promises";
import { mirror } from "./mirror.js";

restartEsbuild();
mirror();

var params = {
  host: "localhost",
  port: 3333,
  root: "./dist/dev/serve",
  open: true,
  logLevel: 2,
};
liveServer.start(params);

(async () => {
  try {
    const watcher = watch("src/sites", { recursive: true });
    for await (const event of watcher) {
      console.log(event);
      if (event.filename.endsWith(".ts") && event.eventType !== "change") {
        restartEsbuild();
      }
      // mirror();
    }
  } catch (err) {
    if (err.name === "AbortError") return;
    throw err;
  }
})();
