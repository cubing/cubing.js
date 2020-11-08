import * as cubing from "./index";

try {
  (globalThis as any).cubing = cubing;
} catch (e) {
  console.log("Unable to set `cubing` on the global object.");
}
