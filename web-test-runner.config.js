import { esbuildPlugin } from "@web/dev-server-esbuild";
import { playwrightLauncher } from "@web/test-runner-playwright";

export default {
  browsers: [playwrightLauncher({ product: "chromium" })],
  files: ["src/**/*.test.dom.ts"],
  plugins: [esbuildPlugin({ ts: true })],
  nodeResolve: true,
  coverageConfig: {
    reportDir: ".temp/coverage",
  },
};
