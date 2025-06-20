import { join } from "node:path";
import { exit } from "node:process";
import { build, type ImportKind, type Metafile, type Plugin } from "esbuild";
import { packageNames } from "../../../build/common/package-info";
import {
  type AllowedImports,
  specAllowedImports as allowedImportsIncludingForSpecFiles,
  mainAllowedImports,
} from "./allowedImports";

async function checkAllowedImports(
  entryPoints: string[],
  allowedImports: AllowedImports,
) {
  // From https://github.com/evanw/esbuild/issues/619#issuecomment-1504100390
  const plugin = {
    name: "mark-bare-imports-as-external",
    setup(build) {
      const filter = /^[^./]|^\.[^./]|^\.\.[^/]/; // Must not start with "/" or "./" or "../"
      build.onResolve({ filter }, (args) => ({
        path: args.path,
        external: true,
      }));
    },
  } satisfies Plugin;

  const { metafile } = await build({
    entryPoints,
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
  function* pathPrefixes(path: string) {
    const pathParts = path.split("/");
    for (let n = pathParts.length; n > 0; n--) {
      yield pathParts.slice(0, n).join("/");
    }
  }

  function matchingPathPrefix(matchPrefixes: string[], path: string) {
    for (const pathPrefix of pathPrefixes(path)) {
      if (matchPrefixes.includes(pathPrefix)) {
        return pathPrefix;
      }
    }
    return false;
  }

  const importKindMap: Partial<Record<ImportKind, "static" | "dynamic">> = {
    "import-statement": "static",
    "dynamic-import": "dynamic",
  } as const;

  function checkImport(
    sourcePath: string,
    importInfo: {
      path: string;
      kind: ImportKind;
      external?: boolean;
      original?: string;
    },
    allowedImports: AllowedImports,
  ) {
    const importKind = importKindMap[importInfo.kind];
    if (!importKind) {
      throw new Error("Unexpected import kind!");
    }
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
          !Array.isArray(allowedImportsForKind)
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

  async function checkImports(
    metafile: Metafile,
    allowedImports: AllowedImports,
  ) {
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
}

await checkAllowedImports(
  [
    "script/**/*.ts",
    "script/**/*.js",
    "src/bin/**/*.ts",
    // TODO: does `esbuild` not support `src/cubing/*/index.ts`?
    ...packageNames.map((packageName) =>
      join("src/cubing", packageName, "index.ts"),
    ),
    "src/sites/**/*.js",
    "src/sites/**/*.ts",
  ],
  mainAllowedImports,
);

await checkAllowedImports(
  ["src/cubing/**/*.ts", "src/cubing/**/*.js"],
  allowedImportsIncludingForSpecFiles,
);
