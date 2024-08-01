import { readdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const DIR = fileURLToPath(
  new URL("../src/cubing/vendor/mpl/twsearch", import.meta.url),
);

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
      break;
    }
  }
  await writeFile(filePath, contents);
}
