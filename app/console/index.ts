import * as cubing from "../../src/cubing/index";

console.log("cubing", cubing);
for (const [moduleName, moduleExport] of Object.entries(cubing)) {
  console.log(moduleName, moduleExport);
  window[moduleName] = moduleExport;
}
