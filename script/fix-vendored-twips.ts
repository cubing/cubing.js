import { Path } from "path-class";

const DIR = Path.resolve("../src/cubing/vendor/mpl/twips", import.meta.url);

for (const dirEnt of await DIR.readDir({
  withFileTypes: true,
  recursive: true,
})) {
  const parentPath = new Path(dirEnt.parentPath);
  const name = new Path(dirEnt.name);
  // Note: we call this on `dirEnt` instead of destructuring `isDirectory` above, because that would produce an incorrect result: https://github.com/oven-sh/bun/issues/21099
  if (dirEnt.isDirectory()) {
    continue;
  }
  const filePath = parentPath.join(name);
  console.log(`Fixing: ${filePath}`);
  let contents = await filePath.readText();
  switch (name.path) {
    case ".DS_Store": {
      // *shakes fist at Apple*
      break;
    }
    case "index.js": {
      contents = contents.replace(`"cubing/alg"`, `"../../../alg"`);
      contents = contents.replace(
        `module_or_path = new URL("twips_wasm_bg.wasm", import.meta.url);`,
        // TODO: change this once the ecosystem is in a better place.
        `throw new Error("Only base 64 WASM loading is supported at the moment.")`,
      );
      break;
    }
    default: {
      break;
    }
  }
  await filePath.write(contents);
}
