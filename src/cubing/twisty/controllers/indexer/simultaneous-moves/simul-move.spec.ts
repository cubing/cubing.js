import { expect, test } from "bun:test";
import { Alg } from "../../../../alg";
import { simulMoves } from "./simul-moves";

test("Ignores comments and newlines when determining simultaneous moves", () => {
  const leavesWithRanges = simulMoves(
    new Alg(`(R // this is a comment
// this too
L)`),
  );
  expect(leavesWithRanges.length).toEqual(2);
  expect(leavesWithRanges[0].end).toEqual(1000);
  expect(leavesWithRanges[1].end).toEqual(1000);
});
