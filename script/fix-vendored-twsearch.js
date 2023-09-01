import { readdir, readFile, writeFile } from "fs/promises";
import { join } from "path";

const DIR = new URL("../src/cubing/vendor/mpl/twsearch", import.meta.url)
  .pathname;
// TODO(https://github.com/cubing/cubing.js/issues/290)
const ROME_JSON = new URL("../rome.json", import.meta.url).pathname;

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

console.log("Fixing:", ROME_JSON);
let contents = await readFile(ROME_JSON, "utf-8");
contents = contents.replaceAll(
  /"src\/cubing\/vendor\/mpl\/twsearch\/twsearch-.*.js"/g,
  `"src/cubing/vendor/mpl/twsearch/${dynamicFileName}"`,
);
await writeFile(ROME_JSON, contents);
