// Note: Only paths with up to 3 parts are currently handled.
export const expectedPrefixes = [
  // Blanket allowance
  "node_modules/@types",
  // Library
  "node_modules/comlink",
  "node_modules/random-uint-below",
  "src",
  // Experiments site
  "node_modules/jszip",
  // Building
  "node_modules/barely-a-dev-server",
  "node_modules/esbuild",
  "node_modules/typescript",
  "script",
  // Playwright
  "node_modules/playwright-core",
  "node_modules/playwright",
  // `node-fetch`
  "node_modules/formdata-polyfill",
  "node_modules/fetch-blob",
  "node_modules/node-fetch",
];
