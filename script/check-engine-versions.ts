#!/usr/bin/env -S bun run --

// TOOD: remove this once https://github.com/oven-sh/bun/issues/5846 is implemented.
// TODO: turn this into a package?

import { env, exit } from "node:process";
import type { JSONSchemaForNPMPackageJsonFiles } from "@schemastore/package";
import { type SystemError, semver } from "bun";
import { Path } from "path-class";
import { PrintableShellCommand } from "printable-shell-command";

const { enginesForDev, engines } = await new Path("./package.json").readJSON<
  JSONSchemaForNPMPackageJsonFiles & { enginesForDev: Record<string, string> }
>();

let exitCode = 0;

const SKIP_DEV_ENGINE_CHECK_ENV_VAR = "SKIP_DEV_ENGINE_CHECK";

async function checkEngine(
  engineID: string,
  versionCommand: PrintableShellCommand,
) {
  const engineRequirement = engines![engineID]!;
  const engineForDevRequirement: string = enginesForDev![engineID]!;

  try {
    let engineVersion: string;
    try {
      engineVersion = await versionCommand.stdout().text();
    } catch {
      console.error(
        `Command failed while getting version:

  ${versionCommand.getPrintableCommand({ mainIndentation: "    " })}`,
      );
      exitCode = 1;
      return;
    }

    function check(
      requirement: string,
      additionalRequirementDescription: string = "",
    ) {
      if (!semver.satisfies(engineVersion, requirement)) {
        console.error(
          `Current version of \`${engineID}\` is out of date: ${engineVersion}`,
        );
        console.error(
          `Version of \`${engineID}\` required${additionalRequirementDescription}: ${requirement}`,
        );
        exitCode = 1;
        return;
      }
    }

    check(engineRequirement);
    if (env[SKIP_DEV_ENGINE_CHECK_ENV_VAR] === "true") {
      console.error(
        `Skipping dev engine check for \`${versionCommand.commandName}\` due to env var: ${SKIP_DEV_ENGINE_CHECK_ENV_VAR}`,
      );
    } else {
      check(engineForDevRequirement, " for dev");
    }
  } catch (e) {
    if ((e as any as SystemError).code === "ENOENT") {
      console.error(
        `Binary is missing for engine version check: \`${versionCommand.commandName}\``,
      );
    } else {
      console.error(`Unexpected error while trying to run version check: ${e}`);
    }
    exitCode = 1;
    return;
  }
}

async function checkEngines(): Promise<void> {
  await Promise.all([
    checkEngine("bun", new PrintableShellCommand("bun", ["--version"])),
    checkEngine("node", new PrintableShellCommand("node", ["--version"])),
  ]);
}

await checkEngines();
exit(exitCode);
