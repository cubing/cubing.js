import {
  existsSync,
  mkdirSync,
  readFileSync,
  renameSync,
  writeFileSync,
} from "fs";
import { join } from "path";
import { execPromise } from "../lib/execPromise.js";

const TEMP_ROOT = "./.temp/initial-setup";
const TARGET_NODE_MODULES_PATH = "./node_modules";

if (existsSync(TARGET_NODE_MODULES_PATH)) {
  process.exit(0);
}

console.log(`
Automatically installing a subset of dependencies.

Note that you have to run \`npm install\` manually if you pull new code or want to run any tests.`);

const json = JSON.parse(readFileSync("package.json", "utf8"));
const oldDevDependencies = json.devDependencies;
json.devDependencies = {};
for (const name of json.minimalDevDependencies) {
  json.devDependencies[name] = oldDevDependencies[name];
}
mkdirSync(TEMP_ROOT, { recursive: true });
writeFileSync(
  join(TEMP_ROOT, "package.json"),
  JSON.stringify(json, null, "  "),
);
console.log(await execPromise(`cd ${TEMP_ROOT} && npm install`));
renameSync(join(TEMP_ROOT, "node_modules"), TARGET_NODE_MODULES_PATH);
