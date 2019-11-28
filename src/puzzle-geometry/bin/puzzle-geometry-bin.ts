// To run this file directly: npx ts-node src/puzzle-geometry/bin/puzzle-geometry-bin.ts

import { PuzzleGeometry } from "..";
import { getpuzzles, parsedesc } from "../PuzzleGeometry";
import { schreierSims } from "../SchreierSims";

let dosvg = false;
let doss = false;
let doksolve = false;
let dogap = false;
let docanon = false;
let do3d = false;
if (typeof (process) !== "undefined" &&
  process.argv && process.argv.length <= 2) {
  console.log(`Usage:  puzzle-geometry [options] [puzzle]

Options:
--ksolve: write ksolve (tws) file
--svg: write SVG (default is flat; --3d makes it 3D)
--gap: write gap
--ss: execute Schrier-Sims calculation
--3d: use 3D format for SVG file
--canon: write canonical string analysis
--rotations: include full-puzzle rotations as moves
--allmoves: includes all moves (i.e., slice moves for 3x3x3)
--outerblockmoves: use outer block moves rather than slice moves
--vertexmoves: for tetrahedral puzzles, prefer vertex moves to face moves
--nocorners: ignore all corners
--noedges: ignore all edges
--nocenters: ignore all centers
--noorientation: ignore orientations
--orientcenters: give centers an orientation
--moves movenames: restrict moves to this list (e.g, U2,F,r)
--optimize: optimize tws/ksolve/gap output
--scramble: scramble solved position
--fixcorner: choose moves to keep one corner fixed
--fixedge: choose moves to keep one edge fixed
--fixcenter: choose moves to keep one center fixed
--verbose (-v): make verbose

The puzzle can be given as a geometric description or by name.
The geometric description starts with c (cube), t (tetrahedron),
d (dodecahedron), i (icosahedron), or o (octahedron), then a
space, then a series of cuts.  Each cut begins with f (for a
cut parallel to faces), v (for a cut perpendicular to a ray
from the center through a corner), or e (for a cut perpendicular
to a ray from the center through an edge) followed by a decimal
number giving a distance, where 1 is the distance between the
center of the puzzle and the center of a face.

The puzzle names recognized are 2x2x2 through 13x13x13, 20x20x20,
master skewb, professor skewb, compy cube, helicopter, dino,
little chop, pyramorphix, mastermorphix, pyraminx, Jing pyraminx,
master paramorphix, megaminx, gigaminx, pentultimate, starminx,
starminx 2, pyraminx crystal, chopasaurus, big chop, skewb diamond,
FTO, Christopher's jewel, octastar, Trajber's octahedron, radio chop,
icosamate, icosahedron 2, icosahedron 3, icosahedron static faces,
icosahedron moving faces, and Eitan's star.

Examples:
   puzzlegeometry --ss 2x2x2
   puzzlegeometry --ss --fixcorner 2x2x2
   puzzlegeometry --ss --moves U,F2,r 4x4x4
   puzzlegeometry --ksolve --optimize --moves U,F,R megaminx
   puzzlegeometry --gap kilominx
`);
}
if (typeof (process) !== "undefined" &&
  process.argv && process.argv.length >= 3) {
  let desc;
  const puzzleList = getpuzzles();
  let argp = 2;
  const optionlist = [];
  let showargs = true;
  while (argp < process.argv.length && process.argv[argp][0] === "-") {
    const option = process.argv[argp++];
    if (option === "--verbose" || option === "-v") {
      optionlist.push("verbose", true);
    } else if (option === "--quiet" || option === "-q") {
      optionlist.push("quiet", true);
      showargs = false;
    } else if (option === "--ksolve") {
      doksolve = true;
    } else if (option === "--svg") {
      showargs = false;
      optionlist.push("quiet", true);
      dosvg = true;
    } else if (option === "--gap") {
      dogap = true;
    } else if (option === "--ss") {
      doss = true;
    } else if (option === "--3d") {
      do3d = true;
    } else if (option === "--canon") {
      docanon = true;
    } else if (option === "--rotations") {
      optionlist.push("rotations", true);
    } else if (option === "--allmoves") {
      optionlist.push("allmoves", true);
    } else if (option === "--outerblockmoves") {
      optionlist.push("outerblockmoves", true);
    } else if (option === "--vertexmoves") {
      optionlist.push("vertexmoves", true);
    } else if (option === "--nocorners") {
      optionlist.push("cornersets", false);
    } else if (option === "--noedges") {
      optionlist.push("edgesets", false);
    } else if (option === "--noorientation") {
      optionlist.push("killorientation", true);
    } else if (option === "--nocenters") {
      optionlist.push("centersets", false);
    } else if (option === "--moves") {
      optionlist.push("movelist", process.argv[argp].split(","));
      argp++;
    } else if (option === "--optimize") {
      optionlist.push("optimize", true);
    } else if (option === "--scramble") {
      optionlist.push("scramble", 100);
    } else if (option === "--fixcorner") {
      optionlist.push("fix", "v");
    } else if (option === "--fixedge") {
      optionlist.push("fix", "e");
    } else if (option === "--fixcenter") {
      optionlist.push("fix", "f");
    } else if (option === "--orientcenters") {
      optionlist.push("orientcenters", true);
    } else {
      throw new Error("Bad option: " + option);
    }
  }
  for (const [name, curDesc] of Object.entries(puzzleList)) {
    if (name === process.argv[argp]) {
      desc = curDesc;
      break;
    }
  }
  let createargs = [];
  if (showargs) {
    console.log("# " + process.argv.join(" "));
  }
  if (desc !== undefined) {
    createargs = parsedesc(desc);
    argp++;
  } else {
    const cuts = [];
    const cutarg = argp++;
    while (argp + 1 < process.argv.length && process.argv[argp].length === 1) {
      cuts.push([process.argv[argp], process.argv[argp + 1]]);
      argp += 2;
    }
    createargs = [process.argv[cutarg], cuts];
  }
  const pg = new PuzzleGeometry(createargs[0], createargs[1], optionlist);
  pg.allstickers();
  pg.genperms();
  // TODO: if (optionlist.indexOf("verbose") !== -1)
  // if (this.verbose) {
  //    console.log("# Stickers " + pg.stickersperface + " cubies " +
  //       pg.cubies.length + " orbits " + pg.orbits +
  //       " shortedge " + pg.shortedge);
  // }
  if (argp < process.argv.length) {
    throw new Error("Unprocessed content at end of command line");
  }
  if (dogap) {
    console.log(pg.writegap());
  } else if (doksolve) {
    console.log(pg.writeksolve()); // TODO: Update arguments
  } else if (dosvg) {
    console.log(pg.generatesvg()); // TODO: Update arguments
  } else if (do3d) {
    console.log(JSON.stringify(pg.get3d()));
  } else if (doss) {
    const os = pg.getOrbitsDef(false);
    const as = os.reassemblySize();
    console.log("Reassembly size is " + as);
    const ss = schreierSims(os.moveops.map((_) => _.toPerm()),
      (_) => console.log(_));
    const r = as / ss;
    console.log("Ratio is " + r);
  } else if (docanon) {
    pg.showcanon((_) => console.log(_));
  }
}
