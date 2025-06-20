/**
 * This allows us to use `chai` with `web-test-runner`, because:
 *
 * - `web-test-runner` can't use `chai` directly, it wants "@esm-bundle/chai"
 * - The re-exported types from `@esm-bundle/chai` don't work without `allowSyntheticDefaultImports` (which we don't need otherwise, and therefore shouldn't enable)
 *
 * So we work around both issues here.
 */

// biome-ignore lint/correctness/noUnusedImports: This is a workaround.
import type {} from "mocha";
import "./Alg.chai";

export * from "./chai";
