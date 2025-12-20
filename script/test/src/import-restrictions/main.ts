import { checkAllowedImports } from "@cubing/dev-config/check-allowed-imports";
import { packageEntryPoints } from "../../../build/common/package-info";
import {
  specAllowedImports as allowedImportsIncludingForSpecFiles,
  mainAllowedImports,
} from "./allowedImports";

await checkAllowedImports(
  {
    "From `./src/cubing/` and `./src/test/` (including test entry points)": {
      entryPoints: [
        "src/cubing/**/*.ts",
        "src/cubing/**/*.js",
        "src/test/**/*.ts",
        "src/test/**/*.js",
      ],
      allowedImports: allowedImportsIncludingForSpecFiles,
    },
    "From library entry points and other non-test entry points in the repo": {
      entryPoints: [
        "script/**/*.ts",
        "script/**/*.js",
        "src/bin/**/*.ts",
        "src/bin/**/*.js",
        ...packageEntryPoints,
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
