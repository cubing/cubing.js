import assert from "node:assert";
import { glob } from "node:fs/promises";
import { Path } from "path-class";
import { randomPermuteInPlace } from "random-uint-below";

const rootFolder = new Path("../../../");

const EXPECTED_NUM_TEST_FILES = 2;

const paths = await Array.fromAsync(glob("./src/**/*.node.test.ts"));
// The import order shouldn't matter. We randomize to avoid implicit dependency on deterministic import order.
randomPermuteInPlace(paths);

let numTestFiles = 0;
for await (const source of paths) {
  console.log(source);
  await import(import.meta.resolve(rootFolder.join(source).path));
  numTestFiles++;
}

assert.equal(numTestFiles, EXPECTED_NUM_TEST_FILES);
