import * as three from "three";
import * as cubing from "../../src/cubing/index";

console.log("cubing", cubing);
for (const [moduleName, moduleExport] of Object.entries(cubing)) {
  console.log(moduleName, moduleExport);
  (window as any)[moduleName] = moduleExport;
}

console.log("three", three);
(window as any).three = three;
