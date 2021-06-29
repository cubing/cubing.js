import * as cubing from ".";

try {
  (globalThis as any).cubing = cubing;
} catch (e) {
  console.log("Unable to set `cubing` on the global object.");
}
