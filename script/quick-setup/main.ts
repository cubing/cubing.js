import {
  existsSync,
  mkdirSync,
  readFileSync,
  renameSync,
  writeFileSync,
} from "node:fs";
import { join } from "node:path";
import { execPromise } from "../lib/execPromise";

const TEMP_ROOT = "./.temp/quick-setup";
const TARGET_NODE_MODULES_PATH = "./node_modules";

if (existsSync(TARGET_NODE_MODULES_PATH)) {
  process.exit(0);
}

console.log(
  `
Automatically installing a subset of dependencies.

Note that you have to run \`npm install\` (or \`npm ci\`) manually if you pull new code or want to run any tests.`,
);

const packageJSON = JSON.parse(readFileSync("package.json", "utf8"));
const lockfileJSON = JSON.parse(readFileSync("package-lock.json", "utf8"));
const oldDevDependencies = packageJSON.devDependencies;
packageJSON.devDependencies = {};
for (const name of packageJSON.minimalDevDependencies) {
  packageJSON.devDependencies[name] = oldDevDependencies[name];
}
mkdirSync(TEMP_ROOT, { recursive: true });
writeFileSync(
  join(TEMP_ROOT, "package.json"),
  JSON.stringify(packageJSON, null, "  "),
);
writeFileSync(
  join(TEMP_ROOT, "package-lock.json"),
  JSON.stringify(lockfileJSON, null, "  "),
);
console.log(await execPromise(`cd ${TEMP_ROOT} && npm ci`));
renameSync(join(TEMP_ROOT, "node_modules"), TARGET_NODE_MODULES_PATH);
