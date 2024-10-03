// To run this file directly:
// bun run src/bin/puzzle-geometry-bin.ts -- <program args>

import {
  PuzzleGeometry,
  getPG3DNamedPuzzles,
  parsePuzzleDescription,
  type ExperimentalPuzzleBaseShape,
  type ExperimentalPuzzleCutType,
  type ExperimentalPuzzleGeometryOptions,
} from "cubing/puzzle-geometry";
import type { PuzzleDescriptionString } from "cubing/puzzle-geometry/PGPuzzles";
import type {
  PuzzleCutDescription,
  PuzzleDescription,
} from "cubing/puzzle-geometry/PuzzleGeometry";

export function asstructured(v: any): any {
  if (typeof v === "string") {
    return JSON.parse(v);
  }
  return v;
}
export function asboolean(v: any): boolean {
  if (typeof v === "string") {
    return v !== "false";
  } else {
    return !!v;
  }
}
export function parsePGOptionList(
  optionlist?: any[],
): ExperimentalPuzzleGeometryOptions {
  const options: ExperimentalPuzzleGeometryOptions = {};
  if (optionlist !== undefined) {
    if (optionlist.length % 2 !== 0) {
      throw new Error("Odd length in option list?");
    }
    for (let i = 0; i < optionlist.length; i += 2) {
      if (optionlist[i] === "verbose") {
        options.verbosity = (options.verbosity ?? 0) + 1;
      } else if (optionlist[i] === "quiet") {
        options.verbosity = 0;
      } else if (optionlist[i] === "allmoves") {
        options.allMoves = asboolean(optionlist[i + 1]);
      } else if (optionlist[i] === "outerblockmoves") {
        options.outerBlockMoves = asboolean(optionlist[i + 1]);
      } else if (optionlist[i] === "vertexmoves") {
        options.vertexMoves = asboolean(optionlist[i + 1]);
      } else if (optionlist[i] === "rotations") {
        options.addRotations = asboolean(optionlist[i + 1]);
      } else if (optionlist[i] === "cornersets") {
        options.includeCornerOrbits = asboolean(optionlist[i + 1]);
      } else if (optionlist[i] === "centersets") {
        options.includeCenterOrbits = asboolean(optionlist[i + 1]);
      } else if (optionlist[i] === "edgesets") {
        options.includeEdgeOrbits = asboolean(optionlist[i + 1]);
      } else if (optionlist[i] === "omit") {
        options.excludeOrbits = optionlist[i + 1];
      } else if (optionlist[i] === "graycorners") {
        options.grayCorners = asboolean(optionlist[i + 1]);
      } else if (optionlist[i] === "graycenters") {
        options.grayCenters = asboolean(optionlist[i + 1]);
      } else if (optionlist[i] === "grayedges") {
        options.grayEdges = asboolean(optionlist[i + 1]);
      } else if (optionlist[i] === "movelist") {
        options.moveList = asstructured(optionlist[i + 1]);
      } else if (optionlist[i] === "killorientation") {
        options.fixedOrientation = asboolean(optionlist[i + 1]);
      } else if (optionlist[i] === "optimize") {
        options.optimizeOrbits = asboolean(optionlist[i + 1]);
      } else if (optionlist[i] === "scramble") {
        options.scrambleAmount = optionlist[i + 1];
      } else if (optionlist[i] === "fix") {
        options.fixedPieceType = optionlist[i + 1];
      } else if (optionlist[i] === "orientcenters") {
        options.orientCenters = asboolean(optionlist[i + 1]);
      } else if (optionlist[i] === "puzzleorientation") {
        options.puzzleOrientation = asstructured(optionlist[i + 1]);
      } else if (optionlist[i] === "puzzleorientations") {
        options.puzzleOrientations = asstructured(optionlist[i + 1]);
      } else {
        throw new Error(
          `Bad option while processing option list ${optionlist[i]}`,
        );
      }
    }
  }
  return options;
}

let dosvg = false;
let doss = false;
let doksolve = false;
let dogap = false;
let domathematica = false;
let docanon = false;
let do3d = false;
if (globalThis.process && process.argv && process.argv.length <= 2) {
  console.log(
    `Usage:  puzzle-geometry [options] [puzzle]

Options:
--ksolve: write ksolve (tws) file
--svg: write SVG (default is flat; --3d makes it 3D)
--gap: write gap
--mathematica: write mathematica
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
--puzzleorientation:  for 3D formats, give puzzle orientation
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
icosamate, Regular Astrominx, Regular Astrominx + Big Chop,
Redicosahedron, Redicosahedron with centers,Icosaminx, and Eitan's star.

Examples:
   puzzlegeometry --ss 2x2x2
   puzzlegeometry --ss --fixcorner 2x2x2
   puzzlegeometry --ss --moves U,F2,r 4x4x4
   puzzlegeometry --ksolve --optimize --moves U,F,R megaminx
   puzzlegeometry --gap --noedges megaminx
`,
  );
}
if (globalThis.process && process.argv && process.argv.length >= 3) {
  let desc: PuzzleDescriptionString | undefined;
  const puzzleList = getPG3DNamedPuzzles();
  let argp = 2;
  const optionlist = [];
  let showargs = true;
  let pascalcomment = false;
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
    } else if (option === "--mathematica") {
      domathematica = true;
      pascalcomment = true;
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
    } else if (option === "--omit") {
      optionlist.push("omit", process.argv[argp].split(","));
      argp++;
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
    } else if (option === "--puzzleorientation") {
      optionlist.push("puzzleorientation", process.argv[argp]);
      argp++;
    } else {
      throw new Error(`Bad option: ${option}`);
    }
  }
  for (const [name, curDesc] of Object.entries(puzzleList)) {
    if (name === process.argv[argp]) {
      desc = curDesc;
      break;
    }
  }
  let puzzleDescription: PuzzleDescription;
  if (showargs) {
    if (pascalcomment) {
      console.log(`(* ${process.argv.join(" ")} *)`);
    } else {
      console.log(`# ${process.argv.join(" ")}`);
    }
  }
  if (desc !== undefined) {
    const parsed = parsePuzzleDescription(desc);
    if (parsed === null) {
      throw new Error("Could not parse puzzle description!");
    }
    puzzleDescription = parsed;
    argp++;
  } else {
    const cuts: PuzzleCutDescription[] = [];
    const cutarg = argp++;
    while (argp + 1 < process.argv.length && process.argv[argp].length === 1) {
      // TODO: validate cut type
      cuts.push({
        cutType: process.argv[argp] as ExperimentalPuzzleCutType,
        distance: parseFloat(process.argv[argp + 1]),
      });
      argp += 2;
    }
    // TODO: validate shape
    puzzleDescription = {
      shape: process.argv[cutarg] as ExperimentalPuzzleBaseShape,
      cuts,
    };
  }
  const options = parsePGOptionList(optionlist);
  const pg = new PuzzleGeometry(puzzleDescription, options);
  pg.allstickers();
  pg.genperms();
  if (argp < process.argv.length) {
    throw new Error("Unprocessed content at end of command line");
  }
  if (dogap) {
    console.log(pg.writegap());
  } else if (domathematica) {
    console.log(pg.writemathematica());
  } else if (doksolve) {
    console.log(pg.writeksolve()); // TODO: Update arguments
  } else if (dosvg) {
    console.log(pg.generatesvg(undefined, undefined, undefined, do3d));
  } else if (do3d) {
    console.log(JSON.stringify(pg.get3d()));
  } else if (doss) {
    pg.writeSchreierSims(console.log);
  } else if (docanon) {
    pg.showcanon((_) => console.log(_));
  }
}
