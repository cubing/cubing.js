import assert from "node:assert";
import { Path } from "path-class";
import { PrintableShellCommand } from "printable-shell-command";

await new PrintableShellCommand("node", [
  "--experimental-web-worker",
  "--",
  Path.resolve("./main.ts", import.meta.url),
]).shellOut();

assert.notEqual(
  await new PrintableShellCommand("node", [
    "--",
    Path.resolve("./main.ts", import.meta.url),
  ])
    .print()
    .spawn().exitCodePromise,
  0,
);
