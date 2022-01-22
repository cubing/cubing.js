import { cubingBundleGlobalExports } from "./cubing.bundle-global.exports";

try {
  (globalThis as any).cubing = cubingBundleGlobalExports;
} catch (e) {
  console.error("Unable to set `cubing` on the global object.");
}
