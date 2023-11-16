import { env } from "node:process";

export const SKIP_SLOW_TESTS: boolean =
  env["CUBING_JS_SKIP_SLOW_TESTS"] === "true";
