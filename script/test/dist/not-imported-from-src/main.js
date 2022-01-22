import { exit, stderr } from "process";
import { execPromise } from "../../../lib/execPromise.js";

// Test that the `dist` dir is not imported from the source (which causes unwanted autocompletion in VSCode).
// In theory we could test this together with import restrictions, but `npx tsc --explainFiles` lets us test directly against the completions.

console.log("Testing the import graph from: npx tsc --explainFiles");

console.log("Building...");
await execPromise("make build"); // TODO: check for full expected build without compiling from scratch.

let output;
try {
  console.log("Getting graph...");
  output = await execPromise("npx tsc --explainFiles -p ./tsconfig.json");
} catch (e) {
  stderr.write(
    "`npx tsc --explainFiles` failed. Please run `make test-tsc` to debug.",
  );
  exit(1);
}
const files = {};
let currentFile = null;
for (const line of output.trim().split("\n")) {
  if (currentFile === null || !line.startsWith("  ")) {
    currentFile = {
      path: line,
      from: [],
    };
    files[line] = currentFile;
  } else {
    if (!line.includes("from file 'dist")) {
      // This theoretically has false positics, but it's good enough for us in practice.
      currentFile.anyImportsNotFromDist = true;
    }
    currentFile.from.push(line);
  }
}

const expectedPrefixes = [
  "node_modules/@babel",
  "node_modules/@types",
  "node_modules/barely-a-dev-server",
  "node_modules/comlink",
  "node_modules/devtools-protocol", // Puppeteer
  "node_modules/esbuild",
  "node_modules/jest-diff",
  "node_modules/jszip",
  "node_modules/pretty-format",
  "node_modules/puppeteer",
  "node_modules/typescript",
  "script",
  "src",
];

for (const file of Object.values(files)) {
  // We special-case this, since we use `anyImportsNotFromDist` to filter for a more helpful output.
  if (file.path.startsWith("dist/") && file.anyImportsNotFromDist) {
    stderr.write("❌ Imports from the `dist` dir are not allowed:\n");
    stderr.write(file.path + "\n");
    stderr.write(file.from.join("\n"));
    exit(1);
  }
  let prefix = file.path.startsWith("node_modules/")
    ? file.path.split("/").slice(0, 2).join("/")
    : file.path.split("/")[0];
  if (!expectedPrefixes.includes(prefix)) {
    stderr.write("Indexed file outside expected prefixes:\n");
    stderr.write(file.path + "\n");
    stderr.write(file.from.join("\n"));
    exit(1);
  }
  console.log(`✅ ${file.path}`);
}
