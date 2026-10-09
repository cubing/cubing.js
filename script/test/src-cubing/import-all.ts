import { Path } from "path-class";
import { packageNames } from "../../build/common/packageNames.ts";

const cubingSrcRootRelative = new Path("../../../src/cubing/");
const INDEX_TS = new Path("index.ts");

async function print(packageName: string): Promise<void> {
  const path = cubingSrcRootRelative.join(packageName, INDEX_TS);
  const imported = await import(path.path);

  console.log(
    `Number of runtime exports for \`${packageName}\`:`,
    Object.keys(imported).length,
  );
}

for (const packageName of packageNames) {
  await print(packageName);
}
