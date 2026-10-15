import { expect, test } from "bun:test";
import { Path } from "path-class";

test("Stub has not changed.", async () => {
  expect(
    await Path.resolve(
      "../sites/experiments.cubing.net/cubing.js/stub/stub.ts",
      import.meta.url,
    ).readText(),
  ).toMatchInlineSnapshot(`
    "// Stub file for testing.
    // Feel free to add code here if you need a quick place to run some code, but avoid committing any changes.
    "
  `);
});
