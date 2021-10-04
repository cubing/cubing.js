import { readFile } from "fs/promises";
import { createServer } from "http";
import { extname, join } from "path";

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

export class CustomServer {
  constructor(options) {
    this.port = options?.port ?? 3333; // number
    this.rootPaths = options.rootPaths; // string[]
    this.debug = options?.debug ?? false;
  }

  start() {
    createServer(this.onRequest.bind(this)).listen(this.port);
    console.log(`Server running at http://localhost:${this.port}/`);
  }

  async onRequest(request, response) {
    let normalizedPath = new URL(request.url, "http://test/").pathname;
    if (normalizedPath.endsWith("/")) {
      normalizedPath += "index.html";
    }

    response.setHeader("Cache-Control", "no-store");

    for (const rootPath of this.rootPaths) {
      const body = await this.tryReadFile(rootPath, normalizedPath);
      if (body !== null) {
        if (this.debug || normalizedPath.endsWith(".html")) {
          console.log(`200 ${request.url} (from ${rootPath})`);
        }
        response.writeHead(200, {
          "Content-Type": this.contentType(normalizedPath),
        });
        response.end(body, "utf-8");
        return;
      }
    }

    console.log(`404 ${request.url}`);
    response.writeHead(404, { "Content-Type": "text/plain" });
    response.end("404 Not Found", "utf-8");
  }

  async tryReadFile(rootPath, normalizedPath) {
    const filePath = join(process.cwd(), rootPath, normalizedPath);

    try {
      return await readFile(filePath);
    } catch (e) {
      return null;
    }
  }

  contentType(normalizedPath) {
    const extension = String(extname(normalizedPath)).toLowerCase();
    return mimeTypes[extension] || "application/octet-stream";
  }
}
