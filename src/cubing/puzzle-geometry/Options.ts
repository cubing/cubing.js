import { parsePuzzleDescription, PuzzleDescription } from "./PuzzleGeometry";

export function parseOptions(argv: string[]): {
  puzzleDescription: PuzzleDescription | null;
  options: PuzzleGeometryOptions;
} {
  let argp = 0;
  const options: PuzzleGeometryOptions = {};
  while (argp < argv.length && argv[argp][0] === "-") {
    const option = argv[argp++];
    if (option === "--rotations") {
      options.addRotations = true;
    } else if (option === "--allmoves") {
      options.allMoves = true;
    } else if (option === "--outerblockmoves") {
      options.outerBlockMoves = true;
    } else if (option === "--vertexmoves") {
      options.vertexMoves = true;
    } else if (option === "--nocorners") {
      options.includeCornerOrbits = false;
    } else if (option === "--noedges") {
      options.includeEdgeOrbits = false;
    } else if (option === "--noorientation") {
      options.fixedOrientation = true;
    } else if (option === "--nocenters") {
      options.includeCenterOrbits = false;
    } else if (option === "--omit") {
      options.excludeOrbits = argv[argp].split(",");
      argp++;
    } else if (option === "--moves") {
      options.moveList = argv[argp].split(",");
      argp++;
    } else if (option === "--optimize") {
      options.optimizeOrbits = true;
    } else if (option === "--scramble") {
      options.scrambleAmount = 100;
    } else if (option === "--fixcorner") {
      options.fixedPieceType = "v";
    } else if (option === "--fixedge") {
      options.fixedPieceType = "e";
    } else if (option === "--fixcenter") {
      options.fixedPieceType = "f";
    } else if (option === "--orientcenters") {
      options.orientCenters = true;
    } else if (option === "--puzzleorientation") {
      options.puzzleOrientation = JSON.parse(argv[argp]); // TODO: Validate input.
      argp++;
    } else {
      throw new Error(`Bad option: ${option}`);
    }
  }
  const puzzleDescription = parsePuzzleDescription(argv.slice(argp).join(" "));
  return { puzzleDescription, options };
}

type FaceName = string;
type OrientationDirection = [number, number, number];
export type FaceBasedOrientationDescription = [
  [FaceName, OrientationDirection],
  [FaceName, OrientationDirection],
];
export type BaseFaceCount = 4 | 6 | 8 | 12 | 20;
export type FaceBasedOrientationDescriptionLookup = Record<
  BaseFaceCount,
  FaceBasedOrientationDescription
>;

function asstructured(v: any): any {
  if (typeof v === "string") {
    return JSON.parse(v);
  }
  return v;
}
function asboolean(v: any): boolean {
  if (typeof v === "string") {
    if (v === "false") {
      return false;
    }
    return true;
  } else {
    return v ? true : false;
  }
}

export class PuzzleGeometryFullOptions {
  verbosity: number = 0; // verbosity (console.log)

  allMoves: boolean = false; // generate all slice moves in ksolve
  outerBlockMoves: boolean; // generate outer block moves
  vertexMoves: boolean = false; // generate vertex moves
  addRotations: boolean = false; // add symmetry information to ksolve output
  moveList: string[] | null = null; // move list to generate

  fixedOrientation: boolean = false; // eliminate any orientations
  fixedPieceType: null | "e" | "v" | "f" = null; // fix a piece?
  orientCenters: boolean = false; // orient centers?

  // TODO: Group these into a single object?
  includeCornerOrbits: boolean = true; // include corner orbits
  includeCenterOrbits: boolean = true; // include center orbits
  includeEdgeOrbits: boolean = true; // include edge orbits
  // Overrides the previous options.
  excludeOrbits: string[] = []; // exclude these orbits
  optimizeOrbits: boolean = false; // optimize PermOri

  grayCorners: boolean = false; // make corner sets gray
  grayCenters: boolean = false; // make center sets gray
  grayEdges: boolean = false; // make edge sets gray

  puzzleOrientation: FaceBasedOrientationDescription | null = null; // single puzzle orientation from options
  puzzleOrientations: FaceBasedOrientationDescriptionLookup | null = null; // puzzle orientation override object from options // TODO: is this needed?

  scrambleAmount: number = 0; // scramble?

  constructor(options: PuzzleGeometryOptions = {}) {
    Object.assign(this, options);
  }
}

export type PuzzleGeometryOptions = Partial<PuzzleGeometryFullOptions>;

export function parsePGOptionList(optionlist?: any[]): PuzzleGeometryOptions {
  const options: PuzzleGeometryOptions = {};
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
