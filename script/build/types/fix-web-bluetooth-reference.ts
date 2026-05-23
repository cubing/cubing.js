import { Path } from "path-class";

const OUTPUT_PATH = new Path("./dist/lib/cubing/bluetooth/index.d.ts");

// We include this at the top of the source for the `cubing/bluetooth` entry
// point, but it's stripped by `tsdown`. So we have to restore it manually. 🤷
// TODO: test that the built `.d.ts` files pass the type checker again, I guess? 🤷
const RESTORED_WEB_BLUETOOTH_REFERENCE = `/// <reference types="web-bluetooth" />

`;

if (!(await OUTPUT_PATH.exists())) {
  console.log(`Output path does not exist: ${OUTPUT_PATH.blue}`);
  throw new Error("Output path does not exist.");
}

const currentContents = await OUTPUT_PATH.readText();
if (currentContents.startsWith(RESTORED_WEB_BLUETOOTH_REFERENCE)) {
  console.info(`✅ OK \`web-bluetooth\` path reference prefix: ${OUTPUT_PATH}`);
} else {
  console.info(
    `✍️ Updating \`web-bluetooth\` path reference prefix: ${OUTPUT_PATH}`,
  );
  OUTPUT_PATH.write(RESTORED_WEB_BLUETOOTH_REFERENCE + currentContents);
}
