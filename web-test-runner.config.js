import { esbuildPlugin } from "@web/dev-server-esbuild";
import { playwrightLauncher } from "@web/test-runner-playwright";
import { Path } from "path-class";

const tempDir = await Path.makeTempDir("cubing-coverage-");
console.log(`Coverage dir: ${tempDir}`);

export default {
  browsers: [playwrightLauncher({ product: "chromium" })],
  files: ["src/**/*.test.dom.ts"],
  plugins: [esbuildPlugin({ ts: true })],
  nodeResolve: true,
  coverageConfig: {
    reportDir: tempDir.toString(),
  },
};
