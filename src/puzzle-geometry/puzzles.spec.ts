import { getPuzzleGeometryByDesc } from "./index";
import { Puzzles } from "./Puzzles";
import { KPuzzleDefinition } from "../kpuzzle";
// import { parse } from "../alg";
// import { TreeAlgorithmIndexer, KSolvePuzzle } from "../twisty";
/**
 *   Test basic things about puzzles created by puzzle
 *   geometry.  We check stickers per face, face count
 *   (and thus total stickers), move count, orbit
 *   count, and cubie count.
 */
const expectedData: { [nam: string]: string } = {
  "2x2x2": "2x2x2, 6, 4, 8, 1, 6",
  "3x3x3": "3x3x3, 6, 9, 26, 3, 9",
  "4x4x4": "4x4x4, 6, 16, 56, 3, 12",
  "5x5x5": "5x5x5, 6, 25, 98, 6, 15",
  "6x6x6": "6x6x6, 6, 36, 152, 7, 18",
  "7x7x7": "7x7x7, 6, 49, 218, 11, 21",
  "8x8x8": "8x8x8, 6, 64, 296, 13, 24",
  "9x9x9": "9x9x9, 6, 81, 386, 18, 27",
  "10x10x10": "10x10x10, 6, 100, 488, 21, 30",
  "11x11x11": "11x11x11, 6, 121, 602, 27, 33",
  "12x12x12": "12x12x12, 6, 144, 728, 31, 36",
  "13x13x13": "13x13x13, 6, 169, 866, 38, 39",
  "20x20x20": "20x20x20, 6, 400, 2168, 91, 60",
  "30x30x30": "30x30x30, 6, 900, 5048, 211, 90",
  "skewb": "skewb, 6, 5, 14, 3, 8",
  "master skewb": "master skewb, 6, 13, 50, 6, 12",
  "professor skewb": "professor skewb, 6, 25, 110, 11, 16",
  "compy cube": "compy cube, 6, 9, 27, 4, 12",
  "helicopter": "helicopter, 6, 8, 32, 2, 18",
  "dino": "dino, 6, 4, 12, 1, 12",
  "little chop": "little chop, 6, 4, 24, 1, 12",
  "pyramorphix": "pyramorphix, 4, 4, 8, 2, 6",
  "mastermorphix": "mastermorphix, 4, 10, 26, 8, 9",
  "pyraminx": "pyraminx, 4, 9, 14, 3, 12",
  "master pyraminx": "master pyraminx, 4, 16, 30, 5, 16",
  "professor pyraminx": "professor pyraminx, 4, 25, 54, 7, 20",
  "Jing pyraminx": "Jing pyraminx, 4, 7, 14, 3, 8",
  "master pyramorphix": "master pyramorphix, 4, 10, 27, 8, 9",
  "megaminx": "megaminx, 12, 11, 62, 3, 18",
  "gigaminx": "gigaminx, 12, 31, 242, 6, 30",
  "pentultimate": "pentultimate, 12, 6, 32, 2, 12",
  "starminx": "starminx, 12, 11, 63, 3, 30",
  "starminx 2": "starminx 2, 12, 11, 102, 3, 18",
  "pyraminx crystal": "pyraminx crystal, 12, 10, 50, 2, 18",
  "chopasaurus": "chopasaurus, 12, 11, 92, 3, 20",
  "big chop": "big chop, 12, 10, 120, 2, 30",
  "skewb diamond": "skewb diamond, 8, 4, 14, 3, 8",
  "FTO": "FTO, 8, 9, 42, 4, 12",
  "Christopher's jewel": "Christopher's jewel, 8, 6, 18, 2, 9",
  "octastar": "octastar, 8, 6, 24, 1, 12",
  "Trajber's octahedron": "Trajber's octahedron, 8, 7, 26, 3, 9",
  "radio chop": "radio chop, 20, 10, 92, 3, 20",
  "icosamate": "icosamate, 20, 4, 32, 2, 12",
  "icosahedron 2": "icosahedron 2, 20, 9, 102, 3, 18",
  "icosahedron 3": "icosahedron 3, 20, 18, 360, 6, 48",
  "icosahedron static faces": "icosahedron static faces, 20, 7, 63, 3, 18",
  "icosahedron moving faces": "icosahedron moving faces, 20, 7, 62, 3, 18",
  "Eitan's star": "Eitan's star, 20, 13, 152, 4, 30",
  "2x2x2 + dino": "2x2x2 + dino, 6, 8, 24, 1, 18",
  "2x2x2 + little chop": "2x2x2 + little chop, 6, 8, 48, 2, 18",
  "dino + little chop": "dino + little chop, 6, 4, 24, 1, 24",
  "2x2x2 + dino + little chop": "2x2x2 + dino + little chop, 6, 8, 48, 2, 30",
  "megaminx + chopasaurus": "megaminx + chopasaurus, 12, 11, 92, 3, 38",
  "starminx combo": "starminx combo, 12, 11, 102, 3, 48",
};
describe("Quat", () => {
  it("testpuzzles", () => {
    for (const [name, desc] of Object.entries(Puzzles)) {
      const options: string[] = [];
      const pg = getPuzzleGeometryByDesc(desc, options);
      const kpuzzledef = pg.writekpuzzle() as KPuzzleDefinition;
      const sep = ", ";
      /*
       *   I want to do this too, but when I add this code and its
       *   imports, I get an ambiguity in Stats module import.
       *
      const seq = Object.getOwnPropertyNames(kpuzzledef.moves).sort().join(" ");
      const algo = parse(seq);
      const ksp = new KSolvePuzzle(kpuzzledef);
      const tai = new TreeAlgorithmIndexer(ksp, algo);
      const tr = tai.transformAtIndex(tai.numMoves());
      console.log(tr);
      const o = Order(kpuzzledef, tr as Transformation);
       */
      const dat =
        name +
        sep +
        pg.baseplanerot.length +
        sep +
        pg.stickersperface +
        sep +
        pg.cubies.length +
        sep +
        Object.getOwnPropertyNames(kpuzzledef.orbits).length +
        sep +
        Object.getOwnPropertyNames(kpuzzledef.moves).length;
      expect(dat).toBe(expectedData[name]);
    }
  });
});
