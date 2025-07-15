import { readdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const DIR = fileURLToPath(
  new URL("../src/cubing/vendor/mpl/twsearch", import.meta.url),
);

for (const dirEnt of await readdir(DIR, {
  withFileTypes: true,
  recursive: true,
})) {
  const { parentPath, name: fileName } = dirEnt;
  // Note: we call this on `dirEnt` instead of destructuring `isDirectory` above, because that would produce an incorrect result: https://github.com/oven-sh/bun/issues/21099
  if (dirEnt.isDirectory()) {
    continue;
  }
  const filePath = join(parentPath, fileName);
  console.log("Fixing:", filePath);
  let contents = await readFile(filePath, "utf-8");
  switch (fileName) {
    case ".DS_Store": {
      // *shakes fist at Apple*
      break;
    }
    case "index.js": {
      contents = contents.replace(`"cubing/alg"`, `"../../../alg"`);
      contents = contents.replace(
        `module_or_path = new URL("twsearch_wasm_bg.wasm", import.meta.url);`,
        // TODO: change this once the ecosystem is in a better place.
        `throw new Error("Only base 64 WASM loading is supported at the moment.")`,
      );
      break;
    }
    default: {
      break;
    }
  }
  await writeFile(filePath, contents);
}
