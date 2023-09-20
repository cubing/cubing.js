import { expect, test } from "bun:test";

import { cachedData222 } from "./sgs-side-events/search-dynamic-sgs-side-events";
import { sgsDataPyraminx } from "./sgs-side-events/search-dynamic-sgs-side-events";
import { sgsDataSkewb } from "./sgs-side-events/search-dynamic-sgs-side-events";

test("Parses 2x2x2 SGS", () => {
  expect(cachedData222).not.toThrow();
});

// test("Parses Megaminx SGS", () => {
//   expect(cachedSGSDataMegaminx).not.toThrow();
// });

test("Parses Pyraminx SGS", () => {
  expect(sgsDataPyraminx).not.toThrow();
});

test("Parses Skewb SGS", () => {
  expect(sgsDataSkewb).not.toThrow();
});
