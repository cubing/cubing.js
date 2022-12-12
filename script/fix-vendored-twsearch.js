import { readdir, readFile, writeFile } from "fs/promises";
import { join } from "path";

const DIR = new URL("../src/cubing/vendor/gpl/twsearch", import.meta.url)
  .pathname;
const ROME_JSON = new URL("../rome.json", import.meta.url).pathname;

const MODULE_MANGLED_PREFIX = `const module_mangled = "node:m-odu-le";
const module_unmangled = () => module_mangled.replace(/-/g, "");
`;

let dynamicFileName = null;
for (const fileName of await readdir(DIR)) {
  const filePath = join(DIR, fileName);
  console.log("Fixing:", filePath);
  let contents = await readFile(filePath, "utf-8");
  switch (fileName) {
    case ".DS_Store": {
      // *shakes fist at Apple*
      break;
    }
    case "index.js": {
      contents = contents.replace(`"cubing/alg"`, `"../../alg"`);
      break;
    }
    default: {
      if (dynamicFileName !== null) {
        throw new Error("Too many files!");
      }
      dynamicFileName = fileName;
      contents = contents.replace(`"module"`, "module_unmangled()");
      if (!contents.startsWith(MODULE_MANGLED_PREFIX)) {
        contents = MODULE_MANGLED_PREFIX + contents;
      }
      break;
    }
  }
  await writeFile(filePath, contents);
}

console.log("Fixing:", ROME_JSON);
let contents = await readFile(ROME_JSON, "utf-8");
contents = contents.replaceAll(
  /"src\/cubing\/vendor\/gpl\/twsearch\/twsearch-.*.js"/g,
  `"src/cubing/vendor/gpl/twsearch/${dynamicFileName}"`,
);
await writeFile(ROME_JSON, contents);
