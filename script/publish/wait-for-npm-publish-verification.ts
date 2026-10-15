#!/usr/bin/env -S bun run --

import { exit } from "node:process";
import { semver } from "bun";
import { Path } from "path-class";
import { PrintableShellCommand } from "printable-shell-command";

const { version: packageVersion } = await Path.resolve(
  "../../package.json",
  import.meta.url,
).readJSON<{ version: string }>();

const SLEEP_DURATION_MS = 10_000;
const NUM_RETRIES = 10;

let latestNPMVersion: string;

for (let i = 0; i < NUM_RETRIES; i++) {
  latestNPMVersion = await new PrintableShellCommand("npm", [
    "show",
    "--",
    "cubing",
    "version",
  ]).text({ trimTrailingNewlines: "single-required" });

  if (semver.satisfies(latestNPMVersion, packageVersion)) {
    console.info(`\`npm\` version is up to date: ${latestNPMVersion}`);
    exit(0);
  }

  console.info(
    `\`npm\` version is out of date: ${latestNPMVersion} (expected ${packageVersion})`,
  );
  console.info(
    `Sleeping and trying again in ${SLEEP_DURATION_MS / 1000} seconds.`,
  );
  await new Promise((resolve) => setTimeout(resolve, SLEEP_DURATION_MS));
}

console.info(`\`npm\` remains out of date.`);
