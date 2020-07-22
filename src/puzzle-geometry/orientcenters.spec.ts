import { getPuzzleGeometryByName, schreierSims } from "./index";
/**
 *   We've had a number of bugs in center orientation (which was initially
 *   added just so 3D rotation worked in twizzle but has seen additional
 *   use since then).  This test file is to help us ensure new bugs don't
 *   pop up.
 */
describe("PuzzleGeometry-OrientCenters", () => {
  it("testcenterorientation", () => {
    let options = [
      "orientcenters",
      "true",
      "movelist",
      '["2U","2R","2F"]',
      "edgesets",
      "false",
      "cornersets",
      "false",
    ];
    let pg = getPuzzleGeometryByName("3x3x3", options);
    let os = pg.getOrbitsDef(false);
    let ss = schreierSims(
      os.moveops.map((_: any) => _.toPerm()),
      (_) => null,
    );
    expect(ss).toBe(768);
    options = ["orientcenters", "true", "cornersets", "false"];
    pg = getPuzzleGeometryByName("skewb", options);
    os = pg.getOrbitsDef(false);
    ss = schreierSims(
      os.moveops.map((_: any) => _.toPerm()),
      (_) => null,
    );
    expect(ss).toBe(11520);
    options = [
      "orientcenters",
      "true",
      "cornersets",
      "false",
      "edgesets",
      "false",
      "allmoves",
      "true",
    ];
    pg = getPuzzleGeometryByName("starminx", options);
    os = pg.getOrbitsDef(false);
    ss = schreierSims(
      os.moveops.map((_: any) => _.toPerm()),
      (_) => null,
    );
    expect(ss).toBe(60);
    options = ["orientcenters", "true", "cornersets", "false"];
    pg = getPuzzleGeometryByName("pentultimate", options);
    os = pg.getOrbitsDef(false);
    ss = schreierSims(
      os.moveops.map((_: any) => _.toPerm()),
      (_) => null,
    );
    expect(ss).toBe(58471875000000000);
  });
});
