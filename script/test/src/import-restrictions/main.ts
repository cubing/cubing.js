import { checkAllowedImports } from "@cubing/dev-config/check-allowed-imports";
import { packageNames } from "../../../build/common/packageNames";
import { SRC_CUBING, TYPESCRIPT_INDEX } from "../../../build/common/paths";
import {
  specAllowedImports as allowedImportsIncludingForSpecFiles,
  mainAllowedImports,
} from "./allowedImports";

await checkAllowedImports(
  {
    "From `./src/cubing/` and `./src/test/`": {
      entryPoints: [
        "src/cubing/**/*.ts",
        "src/cubing/**/*.js",
        "src/test/**/*.ts",
        "src/test/**/*.js",
      ],
      allowedImports: allowedImportsIncludingForSpecFiles,
    },
    "From other entry points in the repo.": {
      entryPoints: [
        "script/**/*.ts",
        "script/**/*.js",
        "src/bin/**/*.ts",
        "src/bin/**/*.js",
        // TODO: does `esbuild` not support `src/cubing/*/index.ts`?
        ...packageNames.map(
          (packageName) => SRC_CUBING.join(packageName, TYPESCRIPT_INDEX).path,
        ),
        "src/sites/**/*.ts",
        "src/sites/**/*.js",
      ],
      allowedImports: mainAllowedImports,
    },
  },
  {
    overrideEsbuildOptions: {
      logOverride: { "empty-glob": "silent" },
    },
  },
);

console.log("No disallowed imports in the project! 🥳");
