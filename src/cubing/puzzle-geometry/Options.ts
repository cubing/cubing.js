export function parseoptions(
  argv: string[],
  optionlist: Array<string | boolean | number | Array<string>>,
): number {
  let argp = 0;
  while (argp < argv.length && argv[argp][0] === "-") {
    const option = argv[argp++];
    if (option === "--rotations") {
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
      optionlist.push("omit", argv[argp].split(","));
      argp++;
    } else if (option === "--moves") {
      optionlist.push("movelist", argv[argp].split(","));
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
      optionlist.push("puzzleorientation", argv[argp]);
      argp++;
    } else {
      throw new Error("Bad option: " + option);
    }
  }
  return argp;
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

export class PuzzleGeometryOptionsObject {
  verbosity: number = 0; // verbosity (console.log)
  allMoves: boolean = false; // generate all slice moves in ksolve
  outerBlockMoves: boolean; // generate outer block moves
  vertexMoves: boolean; // generate vertex moves
  addRotations: boolean; // add symmetry information to ksolve output
  moveList?: string[]; // move list to generate
  puzzleOrientation: FaceBasedOrientationDescription; // single puzzle orientation from options
  puzzleOrientations: FaceBasedOrientationDescriptionLookup; // puzzle orientation override object from options // TODO: is this needed?

  // TODO: Group these into a single object?
  includeCornerOrbits: boolean = true; // include corner orbits
  includeCenterOrbits: boolean = true; // include center orbits
  includeEdgeOrbits: boolean = true; // include edge orbits
  // Overrides the previous options.
  excludeOrbits: string[] = []; // exclude these orbits

  grayCorners: boolean = false; // make corner sets gray
  grayCenters: boolean = false; // make center sets gray
  grayEdges: boolean = false; // make edge sets gray

  fixedOrientation: boolean = false; // eliminate any orientations
  fixedPieceType: "" | "e" | "v" | "f" = ""; // fix a piece?
  orientCenters: boolean = false; // orient centers?

  optimizeOrbits: boolean = false; // optimize PermOri

  scrambleAmount: number = 0; // scramble?
}

export type PuzzleGeometryOptions = Partial<PuzzleGeometryOptionsObject>;

export function optionListToObject(
  optionlist?: any[],
  options?: PuzzleGeometryOptions,
): PuzzleGeometryOptionsObject {
  const optionsObject = new PuzzleGeometryOptionsObject();
  if (optionlist !== undefined) {
    if (optionlist.length % 2 !== 0) {
      throw new Error("Odd length in option list?");
    }
    for (let i = 0; i < optionlist.length; i += 2) {
      if (optionlist[i] === "verbose") {
        optionsObject.verbosity++;
      } else if (optionlist[i] === "quiet") {
        optionsObject.verbosity = 0;
      } else if (optionlist[i] === "allmoves") {
        optionsObject.allMoves = asboolean(optionlist[i + 1]);
      } else if (optionlist[i] === "outerblockmoves") {
        optionsObject.outerBlockMoves = asboolean(optionlist[i + 1]);
      } else if (optionlist[i] === "vertexmoves") {
        optionsObject.vertexMoves = asboolean(optionlist[i + 1]);
      } else if (optionlist[i] === "rotations") {
        optionsObject.addRotations = asboolean(optionlist[i + 1]);
      } else if (optionlist[i] === "cornersets") {
        optionsObject.includeCornerOrbits = asboolean(optionlist[i + 1]);
      } else if (optionlist[i] === "centersets") {
        optionsObject.includeCenterOrbits = asboolean(optionlist[i + 1]);
      } else if (optionlist[i] === "edgesets") {
        optionsObject.includeEdgeOrbits = asboolean(optionlist[i + 1]);
      } else if (optionlist[i] === "omit") {
        optionsObject.excludeOrbits = optionlist[i + 1];
      } else if (optionlist[i] === "graycorners") {
        optionsObject.grayCorners = asboolean(optionlist[i + 1]);
      } else if (optionlist[i] === "graycenters") {
        optionsObject.grayCenters = asboolean(optionlist[i + 1]);
      } else if (optionlist[i] === "grayedges") {
        optionsObject.grayEdges = asboolean(optionlist[i + 1]);
      } else if (optionlist[i] === "movelist") {
        optionsObject.moveList = asstructured(optionlist[i + 1]);
      } else if (optionlist[i] === "killorientation") {
        optionsObject.fixedOrientation = asboolean(optionlist[i + 1]);
      } else if (optionlist[i] === "optimize") {
        optionsObject.optimizeOrbits = asboolean(optionlist[i + 1]);
      } else if (optionlist[i] === "scramble") {
        optionsObject.scrambleAmount = optionlist[i + 1];
      } else if (optionlist[i] === "fix") {
        optionsObject.fixedPieceType = optionlist[i + 1];
      } else if (optionlist[i] === "orientcenters") {
        optionsObject.orientCenters = asboolean(optionlist[i + 1]);
      } else if (optionlist[i] === "puzzleorientation") {
        optionsObject.puzzleOrientation = asstructured(optionlist[i + 1]);
      } else if (optionlist[i] === "puzzleorientations") {
        optionsObject.puzzleOrientations = asstructured(optionlist[i + 1]);
      } else {
        throw new Error(
          "Bad option while processing option list " + optionlist[i],
        );
      }
    }
  }
  Object.assign(optionsObject, options);
  return optionsObject;
}
