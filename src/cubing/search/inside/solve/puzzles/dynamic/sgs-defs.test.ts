import { expect, test } from "bun:test";
import { SKIP_SLOW_TESTS } from "../../../../../../test/SKIP_SLOW_TESTS";
import {
  cachedData222,
  sgsDataPyraminx,
  sgsDataSkewb,
} from "./sgs-side-events/search-dynamic-sgs-side-events";

test.skipIf(SKIP_SLOW_TESTS)("Parses 2x2x2 SGS", () => {
  expect(cachedData222).not.toThrow();
});

// test("Parses Megaminx SGS", () => {
//   expect(cachedSGSDataMegaminx).not.toThrow();
// });

test.skipIf(SKIP_SLOW_TESTS)("Parses Pyraminx SGS", () => {
  expect(sgsDataPyraminx).not.toThrow();
});

test.skipIf(SKIP_SLOW_TESTS)("Parses Skewb SGS", () => {
  expect(sgsDataSkewb).not.toThrow();
});
