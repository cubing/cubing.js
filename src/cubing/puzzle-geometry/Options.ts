import {
  type PuzzleDescription,
  parsePuzzleDescription,
} from "./PuzzleGeometry";

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

export class PuzzleGeometryFullOptions {
  verbosity: number = 0; // verbosity (console.log)

  allMoves: boolean = false; // generate all slice moves in ksolve
  outerBlockMoves: boolean = false; // generate outer block moves
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
