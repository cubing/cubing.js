import * as three from "three";
import { cubingBundleGlobalExports } from "../../../../cubing/cubing.bundle-global.exports";

console.log("cubing", cubingBundleGlobalExports);
for (const [moduleName, moduleExport] of Object.entries(
  cubingBundleGlobalExports,
)) {
  console.log(moduleName, moduleExport);
  (window as any)[moduleName] = moduleExport;
}

console.log("three", three);
(window as any).three = three;
