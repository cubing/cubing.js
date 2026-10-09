import { Path } from "path-class";

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

await print("alg");
await print("bluetooth");
await print("kpuzzle");
await print("notation");
await print("protocol");
await print("puzzle-geometry");
await print("puzzles");
await print("scramble");
await print("search");
await print("stream");
await print("twisty");
