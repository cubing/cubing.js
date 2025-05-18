#!/usr/bin/env bun

// TOOD: remove this once https://github.com/oven-sh/bun/issues/5846 is implemented.
// TODO: turn this into a package?

import { exit } from "node:process";
import { type SystemError, file, spawn } from "bun";
import { satisfies } from "compare-versions";
import { PrintableShellCommand } from "printable-shell-command";

const { engines } = await file("./package.json").json();

let exitCode = 0;

async function checkEngine(
  engineID: string,
  versionCommand: PrintableShellCommand,
) {
  const engineRequirement = engines[engineID];
  try {
    const command = spawn(versionCommand.forBun(), {
      stdout: "pipe",
      stderr: "ignore",
    });

    if ((await command.exited) !== 0) {
      console.error(
        `Command failed while getting version:

  ${versionCommand.getPrintableCommand({ mainIndentation: "    " })}`,
      );
      exitCode = 1;
      return;
    }

    const engineVersion = (await new Response(command.stdout).text()).trim();
    if (!satisfies(engineVersion, engineRequirement)) {
      console.error(
        `Current version of \`${engineID}\` is out of date: ${engineVersion}`,
      );
      console.error(
        `Version of \`${engineID}\` required: ${engineRequirement}`,
      );
      exitCode = 1;
      return;
    }
  } catch (e) {
    if ((e as any as SystemError).code === "ENOENT") {
      const [binary, ..._] = versionCommand.forBun();
      console.error(
        `Binary is missing for engine version check: \`${binary}\``,
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
