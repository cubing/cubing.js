import { exit, stderr } from "process";
import { execPromise } from "../../../lib/execPromise.js";

// Test that the `dist` dir is not imported from the source (which causes unwanted autocompletion in VSCode).
// In theory we could test this together with import restrictions, but `npx tsc --explainFiles` lets us test directly against the completions.

await execPromise("make build"); // TODO: check for full expected build without compiling from scratch.

let output;
try {
  output = await execPromise("npx tsc --explainFiles -p ./tsconfig.json");
} catch (e) {
  stderr.write(
    "`npx tsc --explainFiles` failed. Please run `make test-tsc` to debug.",
  );
  exit(1);
}
const files = {};
let currentFile = null;
for (const line of output.split("\n")) {
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

for (const file of Object.values(files)) {
  if (file.path.startsWith(".")) {
    stderr.write(stderr, "Did not expect relative path:\n");
    stderr.write(stderr, file);
    exit(1);
  }
  if (file.path.startsWith("dist/") && file.anyImportsNotFromDist) {
    stderr.write("Imports from the `dist` dir are not allowed:\n");
    stderr.write(file.path + "\n");
    stderr.write(file.from.join("\n"));
    exit(1);
  }
}
