import { Path } from "path-class";

const OUTPUT_PATH = new Path("./dist/lib/cubing/bluetooth/index.d.ts");

const prefix = `/// <reference types="web-bluetooth" />

`;

if (!(await OUTPUT_PATH.exists())) {
  console.log(`Output path does not exist: ${OUTPUT_PATH.blue}`);
  throw new Error("Output path does not exist.");
}

const currentContents = await OUTPUT_PATH.readText();
if (currentContents.startsWith(prefix)) {
  console.info(`✅ OK \`web-bluetooth\` path reference prefix: ${OUTPUT_PATH}`);
} else {
  console.info(
    `✍️ Updating \`web-bluetooth\` path reference prefix: ${OUTPUT_PATH}`,
  );
  OUTPUT_PATH.write(prefix + currentContents);
}
