import { esbuildPlugin } from "@web/dev-server-esbuild";

export default {
  files: ["src/**/*.spec.ts"],
  plugins: [esbuildPlugin({ ts: true })],
  nodeResolve: true,
  coverageConfig: {
    reportDir: ".temp/coverage",
  },
};
