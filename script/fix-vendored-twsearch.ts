import { readdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";

const DIR = new URL("../src/cubing/vendor/mpl/twsearch-cpp", import.meta.url)
  .pathname;
// TODO(https://github.com/cubing/cubing.js/issues/290)
const BIOME_JSON = new URL("../biome.json", import.meta.url).pathname;

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
      contents = contents.replace(`"cubing/alg"`, `"../../../alg"`);
      break;
    }
    default: {
      if (dynamicFileName !== null) {
        throw new Error("Too many files!");
      }
      dynamicFileName = fileName;
      const lines = ["let _scriptDir;"];
      lineLoop: for (const line of contents.split("\n")) {
        for (const forbidden of [
          "import.meta.url",
          "require2",
          "createRequire",
        ]) {
          if (line.includes(forbidden)) {
            continue lineLoop;
          }
        }
        lines.push(line);
      }
      contents = lines.join("\n");
      break;
    }
  }
  await writeFile(filePath, contents);
}

console.log("Fixing:", BIOME_JSON);
let contents = await readFile(BIOME_JSON, "utf-8");
contents = contents.replaceAll(
  /"src\/cubing\/vendor\/mpl\/twsearch-cpp\/twsearch-.*.js"/g,
  `"src/cubing/vendor/mpl/twsearch-cpp/${dynamicFileName}"`,
);
await writeFile(BIOME_JSON, contents);
