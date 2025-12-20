// https://developer.mozilla.org/en-US/docs/Learn/Server-side/Node_server_without_framework

import assert from "node:assert";
import { readFile } from "node:fs";
import { createServer } from "node:http";
import { Path } from "path-class";
import { needPath } from "../needPath.js";

const DIST_SITES_ROOT = "../../../dist/sites/";

const DIST_SITES_ROOT_EXPANDED = Path.resolve(DIST_SITES_ROOT, import.meta.url);
needPath(
  DIST_SITES_ROOT_EXPANDED.join("alpha.twizzle.net"),
  "make build-sites",
);
needPath(
  DIST_SITES_ROOT_EXPANDED.join("experiments.cubing.net/cubing.js"),
  "make build-sites",
);

/**
 * @param {number=} port
 */
export function startServer(port?: number): void {
  port = port ?? 4443;
  console.log("Starting server.");
  createServer(async (request, response) => {
    assert(typeof request.url !== "undefined");
    // Normalize to avoid path traversal beyond the site root folder.
    const normalizedPath = new URL(request.url, "http://test/").pathname;

    let filePath = DIST_SITES_ROOT_EXPANDED.join(
      new Path(normalizedPath).asRelative(),
    );

    if (filePath.hasTrailingSlash()) {
      filePath = filePath.join("index.html");
    }

    const mimeTypes: Partial<Record<string, string>> = {
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

    const contentType =
      mimeTypes[filePath.extension.toLowerCase()] ?? "application/octet-stream";

    try {
      const content = await filePath.read();
      response.writeHead(200, { "Content-Type": contentType });
      response.end(content, "utf-8");
    } catch (error: any) {
      if (["ENOENT", "EISDIR"].includes(error.code ?? "NO_ERROR_CODE")) {
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
    }
  }).listen(port);
  console.log(`Server running at http://127.0.0.1:${port}/`);
}
