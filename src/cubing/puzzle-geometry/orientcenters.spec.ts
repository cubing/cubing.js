import { expect, test } from "bun:test";

import { getPuzzleGeometryByName } from "./PuzzleGeometry";

import { schreierSims } from "./SchreierSims";

// TODO: convert this to a table-based test.

/**
 *   We've had a number of bugs in center orientation (which was initially
 *   added just so 3D rotation worked in twizzle but has seen additional
 *   use since then).  This test file is to help us ensure new bugs don't
 *   pop up.
 */
test("PuzzleGeometry-OrientCenters test center orientation for 3x3x3", () => {
  const pg = getPuzzleGeometryByName("3x3x3", {
    orientCenters: true,
    moveList: ["2U", "2R", "2F"],
    includeEdgeOrbits: false,
    includeCornerOrbits: false,
  });
  const os = pg.getOrbitsDef(false);
  const ss = schreierSims(
    os.moveops.map((_) => _.toPerm()),
    (_) => null,
  );
  expect(Number(ss)).toStrictEqual(768);
});

test("PuzzleGeometry-OrientCenters test for Skewb", () => {
  const pg = getPuzzleGeometryByName("skewb", {
    orientCenters: true,
    includeCornerOrbits: false,
  });
  const os = pg.getOrbitsDef(false);
  const ss = schreierSims(
    os.moveops.map((_) => _.toPerm()),
    (_) => null,
  );
  expect(Number(ss)).toStrictEqual(11520);
});

test("PuzzleGeometry-OrientCenters test for Starminx", () => {
  const pg = getPuzzleGeometryByName("starminx", {
    orientCenters: true,
    includeCornerOrbits: false,
    includeEdgeOrbits: false,
    allMoves: true,
  });
  const os = pg.getOrbitsDef(false);
  const ss = schreierSims(
    os.moveops.map((_) => _.toPerm()),
    (_) => null,
  );
  expect(Number(ss)).toStrictEqual(60);
});

test("PuzzleGeometry-OrientCenters test for Pentultimate", () => {
  const pg = getPuzzleGeometryByName("pentultimate", {
    orientCenters: true,
    includeCornerOrbits: false,
  });
  const os = pg.getOrbitsDef(false);
  const ss = schreierSims(
    os.moveops.map((_) => _.toPerm()),
    (_) => null,
  );
  expect(Number(ss)).toStrictEqual(58471875000000000);
});
