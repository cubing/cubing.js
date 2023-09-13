import { join } from "node:path";
import { exit } from "node:process";
import { build } from "esbuild";
import { allowedImports } from "./allowedImports.js";
import { packageNames } from "../../../build/common/package-info.js";

// From https://github.com/evanw/esbuild/issues/619#issuecomment-1504100390
const plugin = {
  name: "mark-bare-imports-as-external",
  setup(build) {
    const filter = /^[^.\/]|^\.[^.\/]|^\.\.[^\/]/; // Must not start with "/" or "./" or "../"
    build.onResolve({ filter }, (args) => ({
      path: args.path,
      external: true,
    }));
  },
};

const { metafile } = await build({
  entryPoints: [
    "script/**/*.js",
    "src/bin/**/*.ts",
    // TODO: does `esbuild` not support `src/cubing/*/index.ts`?
    ...packageNames.map((packageName) =>
      join("src/cubing", packageName, "index.ts"),
    ),
    "src/sites/**/*.ts",
  ],
  outdir: ".temp/unused",
  format: "esm",
  write: false,
  bundle: true,
  splitting: true,
  plugins: [plugin],
  metafile: true,
  platform: "node",
});

let failure = false;

// Starts with the path and then keeps chopping off from the right.
function* pathPrefixes(path) {
  const pathParts = path.split("/");
  const prefixes = [];
  for (let n = pathParts.length; n > 0; n--) {
    yield pathParts.slice(0, n).join("/");
  }
}

function matchingPathPrefix(matchPrefixes, path) {
  for (const pathPrefix of pathPrefixes(path)) {
    if (matchPrefixes.includes(pathPrefix)) {
      return pathPrefix;
    }
  }
  return false;
}

function checkImport(sourcePath, importInfo, allowedImports) {
  const importKind = {
    "import-statement": "static",
    "dynamic-import": "dynamic",
  }[importInfo.kind];
  for (const sourcePathPrefix of pathPrefixes(sourcePath)) {
    const matchingSourcePathPrefix = matchingPathPrefix(
      Object.keys(allowedImports),
      sourcePathPrefix,
    );
    if (matchingSourcePathPrefix) {
      const allowedImportsForKind =
        allowedImports[matchingSourcePathPrefix][importKind];
      if (
        typeof allowedImportsForKind !== "undefined" &&
        !(allowedImportsForKind instanceof Array)
      ) {
        throw new Error(
          `Expected a string list for ${importKind} imports under the scope "${matchingSourcePathPrefix}"`,
        );
      }
      if (
        matchingPathPrefix(
          [
            matchingSourcePathPrefix, // allow importing from any source group to itself.
            ...(allowedImportsForKind ?? []),
          ],
          importInfo.path,
        )
      ) {
        process.stdout.write(".");
        return;
      }
    }
  }
  failure = true;
  console.error(`\n❌ File has disallowed ${importKind} import:`);
  console.error(`From file: ${sourcePath}`);
  console.error(`Importing: ${importInfo.path}`);
}

async function checkImports(metafile, allowedImports) {
  console.log("/ means a new file");
  console.log(". means a valid import for that file");

  for (const [filePath, importInfoList] of Object.entries(metafile.inputs)) {
    process.stdout.write("/");
    for (const importInfo of importInfoList.imports) {
      checkImport(filePath, importInfo, allowedImports);
    }
  }
  console.log();
}

await checkImports(metafile, allowedImports);

if (failure) {
  exit(1);
}
console.log("No disallowed imports in the project! 🥳");
