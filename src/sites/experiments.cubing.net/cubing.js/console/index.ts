import * as three from "three";
import { cubing } from "../../cubing/cubing.bundle-global";

console.log("cubing", cubing);
for (const [moduleName, moduleExport] of Object.entries(cubing)) {
  console.log(moduleName, moduleExport);
  (window as any)[moduleName] = moduleExport;
}

console.log("three", three);
(window as any).three = three;
