import { expect, test } from "bun:test";

import { getPuzzleGeometryByName } from "./PuzzleGeometry";

import { schreierSims } from "./SchreierSims";

/**
 *   We've had a number of bugs in center orientation (which was initially
 *   added just so 3D rotation worked in twizzle but has seen additional
 *   use since then).  This test file is to help us ensure new bugs don't
 *   pop up.
 */
test("PuzzleGeometry-OrientCenters test center orientation", () => {
  let pg = getPuzzleGeometryByName("3x3x3", {
    orientCenters: true,
    moveList: ["2U", "2R", "2F"],
    includeEdgeOrbits: false,
    includeCornerOrbits: false,
  });
  let os = pg.getOrbitsDef(false);
  let ss = schreierSims(
    os.moveops.map((_) => _.toPerm()),
    (_) => null,
  );
  expect(Number(ss)).toStrictEqual(768);
  pg = getPuzzleGeometryByName("skewb", {
    orientCenters: true,
    includeCornerOrbits: false,
  });
  os = pg.getOrbitsDef(false);
  ss = schreierSims(
    os.moveops.map((_) => _.toPerm()),
    (_) => null,
  );
  expect(Number(ss)).toStrictEqual(11520);
  pg = getPuzzleGeometryByName("starminx", {
    orientCenters: true,
    includeCornerOrbits: false,
    includeEdgeOrbits: false,
    allMoves: true,
  });
  os = pg.getOrbitsDef(false);
  ss = schreierSims(
    os.moveops.map((_) => _.toPerm()),
    (_) => null,
  );
  expect(Number(ss)).toStrictEqual(60);
  pg = getPuzzleGeometryByName("pentultimate", {
    orientCenters: true,
    includeCornerOrbits: false,
  });
  os = pg.getOrbitsDef(false);
  ss = schreierSims(
    os.moveops.map((_) => _.toPerm()),
    (_) => null,
  );
  expect(Number(ss)).toStrictEqual(58471875000000000);
});
