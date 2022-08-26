// Note: Only paths with up to 3 parts are currently handled.
export const expectedPrefixes = [
  // Blanket allowance
  "node_modules/@types",
  // Library
  "node_modules/comlink",
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
  // Jest
  "node_modules/@babel/parser",
  "node_modules/@babel/types",
  "node_modules/@jest/schemas",
  "node_modules/@sinclair/typebox",
  "node_modules/jest-diff",
  "node_modules/jest-matcher-utils",
  "node_modules/pretty-format",
];
