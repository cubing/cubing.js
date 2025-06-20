import { readFile, writeFile } from "node:fs/promises";
import { exit } from "node:process";
import { fileURLToPath } from "node:url";

const MAKEFILE_PATH = new URL("../../../../Makefile", import.meta.url);
const PACKAGE_JSON_PATH = new URL("../../../../package.json", import.meta.url);
const EXPECTED_NON_PHONY_TARGETS = new Set(["node_modules"]);

const fix = process.argv[2] === "--fix";

let exitCode = 0;
let needsFix = false;
const SIMPLE_MAKEFILE_TARGET_MATCH = /^([A-Za-z-]+):/;

const makefileText = await readFile(MAKEFILE_PATH, "utf-8");
let inScriptsSection = true;
const makefileScriptTargets: string[] = [];
let previousLine = "";
for (const line of makefileText.split("\n")) {
  if (line.includes("Shared with `package.json`")) {
    inScriptsSection = true;
  }
  if (line.includes("Only in `Makefile`")) {
    inScriptsSection = false;
  }
  if (inScriptsSection) {
    const match = SIMPLE_MAKEFILE_TARGET_MATCH.exec(line);
    if (match) {
      const target = match[1];
      if (
        previousLine !== `.PHONY: ${target}` &&
        !EXPECTED_NON_PHONY_TARGETS.has(target)
      ) {
        console.error(
          `
The following target is not properly marked as .PHONY: ${target}

This must be fixed by hand. Please do one of the following:

1. Add the following to \`Makefile\` on the line immediately before the target is defined:

.PHONY: ${target}

2. Add "${target}" to \`EXPECTED_NON_PHONY_TARGETS\` in \`${fileURLToPath(
            new URL(import.meta.url),
          )}\`
`,
        );
        exit(1);
      }
      makefileScriptTargets.push(target);
    }
  }
  previousLine = line;
}

const packageJSON = JSON.parse(await readFile(PACKAGE_JSON_PATH, "utf-8"));
const packageJSONScripts = [];
for (const [scriptName, shell] of Object.entries(packageJSON.scripts)) {
  if (shell !== `make ${scriptName}`) {
    console.error(
      `Script in \`package.json\` does not have the correct shell: ${scriptName}`,
    );
    if (!fix) {
      exitCode = 1;
    }
  }
  packageJSONScripts.push(scriptName);
}

function logDifference(from: string[], subtract: string[]) {
  const output = [];
  for (const entry of from) {
    if (!subtract.includes(entry)) {
      output.push(entry);
    }
  }
  if (output.length === 0) {
    console.log("  (none)");
  } else {
    needsFix = true;
    if (!fix) {
      exitCode = 1;
    }
    console.log(output.map((entry) => `  ${entry}`).join("\n"));
  }
}

console.log("Makefile targets that are not package.json scripts:");
logDifference(makefileScriptTargets, packageJSONScripts);
console.log("package.json scripts that are not Makefile targets:");
logDifference(packageJSONScripts, makefileScriptTargets);

if (!fix && needsFix) {
  console.info("\nTo fix, run: `make fix-src-scripts-consistency`\n");
}

if (exitCode !== 0) {
  process.exit(exitCode);
}

if (fix && needsFix) {
  console.log("Fixing...");
  packageJSON.scripts = Object.fromEntries(
    makefileScriptTargets.map((target) => [target, `make ${target}`]),
  );
  writeFile(PACKAGE_JSON_PATH, `${JSON.stringify(packageJSON, null, "  ")}\n`);
}
