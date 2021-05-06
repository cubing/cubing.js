import { readFile } from "fs";
import { createServer } from "http";

const files = {
  "/": { relativePath: "./server/index.html", contentType: "text/html" },
  "/cubing.bundle-global.js": {
    relativePath: "../../../dist/bundle-global/cubing.bundle-global.js",
    contentType: "text/javascript",
  },
};

createServer(function (req, res) {
  const info = files[req.url.split("?")[0]]; // TODO: better way to strip search params?
  if (!info) {
    res.writeHead(404);
    res.end("invalid path");
    return;
  }
  const path = new URL(info.relativePath, import.meta.url).pathname;
  readFile(path, function (err, data) {
    if (err) {
      console.error(
        "Serving error.\nMake sure to run `make build-bundle-global` first.",
      );
      return;
    }
    res.writeHead(200, { "Content-Type": info.contentType });
    res.end(data);
  });
}).listen(3334);
