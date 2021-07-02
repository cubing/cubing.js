// https://developer.mozilla.org/en-US/docs/Learn/Server-side/Node_server_without_framework

import { readFile } from "fs";
import { createServer } from "http";
import { extname, join } from "path";
import { needFolder } from "../need-folder.js";

const FILE_ROOT = "../../../dist/experiments/";

const FILE_ROOT_EXPANDED = new URL(FILE_ROOT, import.meta.url).pathname;
needFolder(FILE_ROOT_EXPANDED, "make build-experiments");

export function startServer(port) {
  port ??= 4443;
  console.log("Starting server.");
  createServer(function (request, response) {
    console.log("request ", request.url);

    const normalizedURL = new URL(request.url, "http://test/").pathname;
    let segments = normalizedURL.split("/");
    const topPath = segments.splice(1, 1)[0];
    const remainingPath = segments.join("/");

    let filePath;
    if (topPath === "cubing.js") {
      filePath = new URL(join(FILE_ROOT, remainingPath), import.meta.url)
        .pathname;
    } else {
      response.writeHead(404, { "Content-Type": "text/html" });
      response.end("bad path", "utf-8");
      return;
    }

    if (filePath.endsWith("/")) {
      filePath += "index.html";
    }

    var extension = String(extname(filePath)).toLowerCase();
    var mimeTypes = {
      ".html": "text/html",
      ".js": "text/javascript",
      ".css": "text/css",
      ".json": "application/json",
      ".png": "image/png",
      ".jpg": "image/jpg",
      ".gif": "image/gif",
      ".svg": "image/svg+xml",
      ".wav": "audio/wav",
      ".mp4": "video/mp4",
      ".woff": "application/font-woff",
      ".ttf": "application/font-ttf",
      ".eot": "application/vnd.ms-fontobject",
      ".otf": "application/font-otf",
      ".wasm": "application/wasm",
    };

    var contentType = mimeTypes[extension] || "application/octet-stream";

    readFile(filePath, function (error, content) {
      if (error) {
        if (error.code === "ENOENT") {
          readFile("./404.html", function (_error, content) {
            response.writeHead(404, { "Content-Type": "text/html" });
            response.end(content, "utf-8");
          });
        } else {
          response.writeHead(500);
          response.end(
            "Sorry, check with the site admin for error: " +
              error.code +
              " ..\n",
          );
        }
      } else {
        response.writeHead(200, { "Content-Type": contentType });
        response.end(content, "utf-8");
      }
    });
  }).listen(port);
  console.log(`Server running at http://127.0.0.1:${port}/`);
}
