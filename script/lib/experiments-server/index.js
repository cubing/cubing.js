// https://developer.mozilla.org/en-US/docs/Learn/Server-side/Node_server_without_framework

import { readFile } from "node:fs";
import { createServer } from "node:http";
import { extname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { needPath } from "../needPath.js";

const DIST_SITES_ROOT = "../../../dist/sites/";

const DIST_SITES_ROOT_EXPANDED = fileURLToPath(
  new URL(DIST_SITES_ROOT, import.meta.url),
);
needPath(
  join(DIST_SITES_ROOT_EXPANDED, "alpha.twizzle.net"),
  "make build-sites",
);
needPath(
  join(DIST_SITES_ROOT_EXPANDED, "experiments.cubing.net/cubing.js"),
  "make build-sites",
);

/**
 * @param {number=} port
 */
export function startServer(port) {
  port = port ?? 4443;
  console.log("Starting server.");
  createServer((request, response) => {
    const normalizedPath = new URL(request.url, "http://test/").pathname;

    let filePath;
    filePath = fileURLToPath(
      new URL(join(DIST_SITES_ROOT_EXPANDED, normalizedPath), import.meta.url),
    );

    if (filePath.endsWith("/")) {
      filePath += "index.html";
    }

    /** @type string */
    const extension = extname(filePath).toLowerCase();
    /** @type Partial<Record<string, string>> */
    const mimeTypes = {
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

    const contentType = mimeTypes[extension] ?? "application/octet-stream";

    readFile(filePath, (error, content) => {
      if (error) {
        if (["ENOENT", "EISDIR"].includes(error.code)) {
          readFile("./404.html", (_error, content) => {
            response.writeHead(404, { "Content-Type": "text/html" });
            response.end(content, "utf-8");
          });
        } else {
          response.writeHead(500);
          response.end(
            `Sorry, check with the site admin for error: ${error.code} ..\n`,
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
