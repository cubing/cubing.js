import { Move, QuantumMove } from "../alg";
import type { KPuzzleDefinition, KTransformationData } from "../kpuzzle";
import { defaultPlatonicColorSchemes } from "./colors";
import { FaceNameSwizzler } from "./FaceNameSwizzler";
import {
  FaceRenamingMapper,
  FTONotationMapper,
  MegaminxScramblingNotationMapper,
  NullMapper,
  NxNxNCubeMapper,
  PyraminxNotationMapper,
  SkewbNotationMapper,
  TetraminxNotationMapper,
  type NotationMapper,
} from "./notation-mapping";
import { remapKPuzzleDefinition } from "./notation-mapping/NotationMapper";
import {
  PuzzleGeometryFullOptions,
  type BaseFaceCount,
  type FaceBasedOrientationDescription,
  type FaceBasedOrientationDescriptionLookup,
  type PuzzleGeometryOptions,
} from "./Options";
import { iota, Perm, zeros } from "./Perm";
import {
  externalName,
  PGOrbit,
  PGOrbitDef,
  PGOrbitsDef,
  PGTransform,
  showcanon,
  VisibleState,
} from "./PermOriSet";
import {
  PGPuzzles,
  type PuzzleDescriptionString,
  type PuzzleName,
} from "./PGPuzzles";
import {
  closure,
  cube,
  dodecahedron,
  getface,
  icosahedron,
  octahedron,
  tetrahedron,
  uniqueplanes,
} from "./PlatonicGenerator";
import { centermassface, Quat } from "./Quat";
import { schreierSims } from "./SchreierSims";

export interface TextureMapper {
  getuv(fn: number, threed: number[]): number[];
}

export interface StickerDatSticker {
  coords: number[];
  color: string;
  orbit: string;
  ord: number;
  ori: number;
  face: number;
  isDup?: boolean;
}

export interface StickerDatFace {
  coords: number[];
  name: string;
}

export type StickerDatAxis = {
  coordinates: number[];
  quantumMove: Move;
  order: number;
};

export interface StickerDat {
  stickers: StickerDatSticker[];
  faces: StickerDatFace[];
  axis: StickerDatAxis[];
  unswizzle(mv: Move): Move | null;
  notationMapper: NotationMapper;
  textureMapper: TextureMapper;
}

// you can fill these in to help with timing if you want
function tstart(s: string): string {
  return s;
}

function tend(_: string): void {}

class Face {
  private coords: number[];
  public length: number;
  constructor(q: Quat[]) {
    this.coords = new Array(q.length * 3);
    for (let i = 0; i < q.length; i++) {
      this.coords[3 * i] = q[i].b;
      this.coords[3 * i + 1] = q[i].c;
      this.coords[3 * i + 2] = q[i].d;
    }
    this.length = q.length;
  }

  get(off: number): Quat {
    return new Quat(
      0,
      this.coords[3 * off],
      this.coords[3 * off + 1],
      this.coords[3 * off + 2],
    );
  }

  centermass(): Quat {
    let sx = 0;
    let sy = 0;
    let sz = 0;
    for (let i = 0; i < this.length; i++) {
      sx += this.coords[3 * i];
      sy += this.coords[3 * i + 1];
      sz += this.coords[3 * i + 2];
    }
    return new Quat(0, sx / this.length, sy / this.length, sz / this.length);
  }

  rotate(q: Quat): Face {
    const a = [];
    for (let i = 0; i < this.length; i++) {
      a.push(this.get(i).rotatepoint(q));
    }
    return new Face(a);
  }

  rotateforward(): Face {
    const a = [];
    for (let i = 1; i < this.length; i++) {
      a.push(this.get(i));
    }
    a.push(this.get(0));
    return new Face(a);
  }
}

export class FaceTree {
  constructor(
    private face: Quat[],
    private left?: FaceTree,
    private right?: FaceTree,
  ) {}

  public split(q: Quat): FaceTree {
    const t = q.cutface(this.face);
    if (t !== null) {
      if (this.left === undefined) {
        this.left = new FaceTree(t[0]);
        this.right = new FaceTree(t[1]);
      } else {
        this.left = this.left?.split(q);
        this.right = this.right?.split(q);
      }
    }
    return this;
  }

  public collect(arr: Face[], leftfirst: boolean): Face[] {
    if (this.left === undefined) {
      arr.push(new Face(this.face));
    } else if (leftfirst) {
      this.left?.collect(arr, false);
      this.right?.collect(arr, true);
    } else {
      this.right?.collect(arr, false);
      this.left?.collect(arr, true);
    }
    return arr;
  }
}

export function expandfaces(rots: Quat[], faces: Face[]): Face[] {
  // given a set of faces, expand by rotation set
  const nfaces = [];
  for (const rot of rots) {
    for (const face of faces) {
      nfaces.push(face.rotate(rot));
    }
  }
  return nfaces;
}

//  Now we have a geometry class that does the 3D goemetry to calculate
//  individual sticker information from a Platonic solid and a set of
//  cuts.  The cuts must have the same symmetry as the Platonic solid;
//  we even restrict them further to be either vertex-normal,
//  edge-normal, or face-parallel cuts.  Right now our constructor takes
//  a character solid indicator (one of c(ube), o(ctahedron), i(cosahedron),
//  t(etradron), or d(odecahedron), followed by an array of cuts.
//  Each cut is a character normal indicator that is either f(ace),
//  e(dge), or v(ertex), followed by a floating point value that gives
//  the depth of the cut where 0 is the center and 1 is the outside
//  border of the shape in that direction.

//  This is a heavyweight class with lots of members and construction
//  is slow.  Be gentle.

//  Everything except a very few methods should be considered private.

const eps: number = 1e-9;
const copyright = "PuzzleGeometry 0.1 Copyright 2018 Tomas Rokicki.";
const permissivieMoveParsing = false;

// This is a description of the nets and the external names we give each
// face.  The names should be a set of prefix-free upper-case alphabetics
// so
// we can easily also name and distinguish vertices and edges, but we
// may change this in the future.  The nets consist of a list of lists.
// Each list gives the name of a face, and then the names of the
// faces connected to that face (in the net) in clockwise order.
// The length of each list should be one more than the number of
// edges in the regular polygon for that face.  All polygons must
// have the same number of edges.
// The first two faces in the first list must describe a horizontal edge
// that is at the bottom of a regular polygon.  The first two faces in
// every subsequent list for a given polytope must describe a edge that
// is directly connected in the net and has already been described (this
// sets the location and orientation of the polygon for that face.
// Any edge that is not directly connected in the net should be given
// the empty string as the other face.  All faces do not need to have
// a list starting with that face; just enough to describe the full
// connectivity of the net.
//
// TODO: change this back to a const JSON definition.
function defaultnets(): any {
  return {
    // four faces: tetrahedron
    4: [["F", "D", "L", "R"]],
    // six faces: cube
    6: [
      ["F", "D", "L", "U", "R"],
      ["R", "F", "", "B", ""],
    ],
    // eight faces: octahedron
    8: [
      ["F", "D", "L", "R"],
      ["D", "F", "BR", ""],
      ["BR", "D", "", "BB"],
      ["BB", "BR", "U", "BL"],
    ],
    // twelve faces:  dodecahedron; U/F/R/F/BL/BR from megaminx
    12: [
      ["U", "F", "", "", "", ""],
      ["F", "U", "R", "C", "A", "L"],
      ["R", "F", "", "", "E", ""],
      ["E", "R", "", "BF", "", ""],
      ["BF", "E", "BR", "BL", "I", "D"],
    ],
    // twenty faces: icosahedron
    20: [
      ["R", "C", "F", "E"],
      ["F", "R", "L", "U"],
      ["L", "F", "A", ""],
      ["E", "R", "G", "I"],
      ["I", "E", "S", "H"],
      ["S", "I", "J", "B"],
      ["B", "S", "K", "D"],
      ["K", "B", "M", "O"],
      ["O", "K", "P", "N"],
      ["P", "O", "Q", ""],
    ],
  };
}

// Orientation conventions are specified here.  For each of the five platonic
// solids, by face count, we have three lists of "cubie names" consisting of
// a concatenation of face names.  For vertex (corner) and edge cubies, the
// first face in the concatenated name is the one that will be marked.
// For center orientations, the first face specifies which center we are
// referring to, and the second face specifies the direction of the mark for
// that face.

const orientationDefaults = {
  4: {
    v: ["DFR", "DLF", "DRL", "FLR"],
    e: ["FR", "LF", "DF", "DL", "RD", "RL"],
    c: ["DF", "FD", "RL", "LR"],
  },
  6: {
    v: ["URF", "UBR", "ULB", "UFL", "DFR", "DRB", "DBL", "DLF"],
    e: ["UF", "UR", "UB", "UL", "DF", "DR", "DB", "DL", "FR", "FL", "BR", "BL"],
    c: ["UB", "LU", "FU", "RU", "BU", "DF"],
  },
  8: {
    v: ["UBBBRR", "URFL", "ULBLBB", "DBRBBBL", "DBLLF", "DFRBR"],
    e: [
      "UL",
      "UBB",
      "UR",
      "BRD",
      "BLD",
      "FD",
      "BRR",
      "FR",
      "FL",
      "BLL",
      "BLBB",
      "BRBB",
    ],
    c: ["BBU", "LU", "RU", "BRD", "FD", "BLD", "DF", "UBB"],
  },
  12: {
    v: [
      "URF",
      "UFL",
      "ULBL",
      "UBLBR",
      "UBRR",
      "DEBF",
      "DBFI",
      "DIA",
      "DAC",
      "DCE",
      "LAI",
      "ALF",
      "FCA",
      "CFR",
      "REC",
      "ERBR",
      "BRBFE",
      "BFBRBL",
      "BLIBF",
      "IBLL",
    ],
    e: [
      "UF",
      "UR",
      "UBR",
      "UBL",
      "UL",
      "ER",
      "EBR",
      "EBF",
      "ED",
      "EC",
      "IBF",
      "IBL",
      "IL",
      "IA",
      "ID",
      "AC",
      "CF",
      "FA",
      "BFBR",
      "BRBL",
      "BLBF",
      "CD",
      "AD",
      "AL",
      "FL",
      "FR",
      "CR",
      "BFD",
      "BRR",
      "BLL",
    ],
    c: [
      "UF",
      "FU",
      "DBF",
      "BFD",
      "AD",
      "CD",
      "BRU",
      "BLU",
      "LA",
      "RA",
      "EBR",
      "IBL",
    ],
  },
  20: {
    v: [
      "FLPQU",
      "FUGER",
      "FRCAL",
      "HCREI",
      "ISBDH",
      "JSIEG",
      "BSJMK",
      "MQPOK",
      "ONDBK",
      "NOPLA",
      "UQMJG",
      "DNACH",
    ],
    e: [
      "FU",
      "FL",
      "FR",
      "EG",
      "ER",
      "EI",
      "SJ",
      "SI",
      "SB",
      "KM",
      "KB",
      "KO",
      "PQ",
      "PO",
      "PL",
      "UG",
      "JG",
      "MQ",
      "UQ",
      "HC",
      "HD",
      "ND",
      "NA",
      "JM",
      "CA",
      "AL",
      "CR",
      "HI",
      "DB",
      "NO",
    ],
    c: [
      "FU",
      "UF",
      "GE",
      "EG",
      "JS",
      "SJ",
      "MK",
      "KM",
      "QP",
      "PQ",
      "LA",
      "AL",
      "RC",
      "CR",
      "IH",
      "HI",
      "BD",
      "DB",
      "ON",
      "NO",
    ],
  },
};

/*
 *  Default orientations for the puzzles in 3D space.  Can be overridden
 *  by puzzleOrientation or puzzleOrientations options.
 *
 *  These are defined to have a strong intuitive vertical (y) direction
 *  since 3D orbital controls need this.  In comments, we list the
 *  preferred initial camera orientation for each puzzle for twizzle;
 *  this information is explicitly given in the twizzle app file.
 */
// TODO: change this back to a const JSON definition.
function defaultOrientations(): FaceBasedOrientationDescriptionLookup {
  return {
    4: [
      ["FLR", [0, 1, 0]],
      ["F", [0, 0, 1]],
    ], // FLR towards viewer
    6: [
      ["U", [0, 1, 0]],
      ["F", [0, 0, 1]],
    ], // URF towards viewer
    8: [
      ["U", [0, 1, 0]],
      ["F", [0, 0, 1]],
    ], // FLUR towards viewer
    12: [
      ["U", [0, 1, 0]],
      ["F", [0, 0, 1]],
    ], // F towards viewer
    20: [
      ["GUQMJ", [0, 1, 0]],
      ["F", [0, 0, 1]],
    ], // F towards viewer
  };
}

function findelement(a: Quat[][], p: Quat): number {
  // find something in facenames, vertexnames, edgenames
  for (let i = 0; i < a.length; i++) {
    if (a[i][0].dist(p) < eps) {
      return i;
    }
  }
  throw new Error("Element not found");
}

export function getPG3DNamedPuzzles(): {
  [s: string]: PuzzleDescriptionString;
} {
  // get some simple definitions of basic puzzles
  return PGPuzzles;
}

export function getPuzzleDescriptionString(
  puzzleName: PuzzleName,
): PuzzleDescriptionString {
  // get some simple definitions of basic puzzles
  return PGPuzzles[puzzleName];
}

export const PUZZLE_BASE_SHAPES = ["c", "t", "o", "d", "i"] as const;
export type PuzzleBaseShape = (typeof PUZZLE_BASE_SHAPES)[number];

export const PUZZLE_CUT_TYPES = ["f", "v", "e"] as const;
export type PuzzleCutType = (typeof PUZZLE_CUT_TYPES)[number];

export type PuzzleCutDescription = { cutType: PuzzleCutType; distance: number };
export type PuzzleDescription = {
  shape: PuzzleBaseShape;
  cuts: PuzzleCutDescription[];
};

export function parsePuzzleDescription(
  s: PuzzleDescriptionString,
): PuzzleDescription | null {
  // parse a text description
  const a = s.split(/ /).filter(Boolean);
  if (a.length % 2 === 0) {
    return null;
  }
  const shape = a[0];
  if (
    shape !== "o" &&
    shape !== "c" &&
    shape !== "i" &&
    shape !== "d" &&
    shape !== "t"
  ) {
    return null;
  }
  const cuts: PuzzleCutDescription[] = [];
  for (let i = 1; i < a.length; i += 2) {
    if (a[i] !== "f" && a[i] !== "v" && a[i] !== "e") {
      return null;
    }
    cuts.push({
      cutType: a[i] as PuzzleCutType,
      distance: parseFloat(a[i + 1]),
    });
  }
  return { shape, cuts };
}

export function getPuzzleGeometryByDesc(
  desc: string,
  options: PuzzleGeometryOptions = {},
): PuzzleGeometry {
  const parsed = parsePuzzleDescription(desc);
  if (parsed === null) {
    throw new Error("Could not parse the puzzle description");
  }
  const pg = new PuzzleGeometry(
    parsed,
    Object.assign({}, { allMoves: true } as PuzzleGeometryOptions, options),
  );
  pg.allstickers();
  pg.genperms();
  return pg;
}

export function getPuzzleGeometryByName(
  puzzleName: PuzzleName,
  options?: PuzzleGeometryOptions,
): PuzzleGeometry {
  return getPuzzleGeometryByDesc(PGPuzzles[puzzleName], options);
}

function getmovename(
  geo: any,
  bits: number[],
  slices: number,
): [string, boolean] {
  // generate a move name based on bits, slice, and geo
  // if the move name is from the opposite face, say so.
  // find the face that's turned.
  let inverted = false;
  if (slices - bits[1] < bits[0]) {
    // flip if most of the move is on the other side
    geo = [geo[2], geo[3], geo[0], geo[1]];
    bits = [slices - bits[1], slices - bits[0]];
    inverted = true;
  }
  let movenameFamily = geo[0] as string;
  let movenamePrefix = "";
  if (bits[0] === 0 && bits[1] === slices) {
    movenameFamily = `${movenameFamily}v`;
  } else if (bits[0] === bits[1]) {
    if (bits[1] > 0) {
      movenamePrefix = String(bits[1] + 1);
    }
  } else if (bits[0] === 0) {
    movenameFamily = movenameFamily.toLowerCase();
    if (bits[1] > 1) {
      movenamePrefix = String(bits[1] + 1);
    }
  } else {
    throw new Error(
      `We only support slice and outer block moves right now. ${bits}`,
    );
  }
  return [movenamePrefix + movenameFamily, inverted];
}

// split a geometrical element into face names.  Do greedy match.
// Permit underscores between names.
function splitByFaceNames(s: string, facenames: [Quat[], string][]): string[] {
  const r: string[] = [];
  let at = 0;
  while (at < s.length) {
    if (at > 0 && at < s.length && s[at] === "_") {
      at++;
    }
    let currentMatch = "";
    for (const facename of facenames) {
      if (
        s.substr(at).startsWith(facename[1]) &&
        facename[1].length > currentMatch.length
      ) {
        currentMatch = facename[1];
      }
    }
    if (currentMatch !== "") {
      r.push(currentMatch);
      at += currentMatch.length;
    } else {
      throw new Error(`Could not split ${s} into face names.`);
    }
  }
  return r;
}

function toCoords(q: Quat, maxdist: number): number[] {
  return [q.b / maxdist, -q.c / maxdist, q.d / maxdist];
}

function toFaceCoords(q: Face, maxdist: number): number[] {
  const r = [];
  const n = q.length;
  for (let i = 0; i < n; i++) {
    const pt = toCoords(q.get(n - i - 1), maxdist);
    r[3 * i] = pt[0];
    r[3 * i + 1] = pt[1];
    r[3 * i + 2] = pt[2];
  }
  return r;
}

type MoveSetGeo = [string, string, string, string, number];

/** @category PuzzleGeometry */
export class PuzzleGeometry {
  private rotations: Quat[]; // all members of the rotation group
  public baseplanerot: Quat[]; // unique rotations of the baseplane
  private baseplanes: Quat[]; // planes, corresponding to faces
  private facenames: [Quat[], string][]; // face names
  private faceplanes: [Quat, string][]; // face planes
  private edgenames: [Quat, string][]; // edge names
  private vertexnames: [Quat, string][]; // vertexnames
  private geonormals: [Quat, string, string][]; // all geometric directions, with names and types
  private moveplanes: Quat[]; // the planes that split moves
  private moveplanes2: Quat[]; // the planes that split moves, filtered
  public moveplanesets: Quat[][]; // the move planes, in parallel sets
  private moveplanenormals: Quat[]; // one move plane
  public movesetorders: number[]; // the order of rotations for each move set
  public movesetgeos: MoveSetGeo[]; // geometric feature information for move sets
  private basefaces: Face[]; // polytope faces before cuts
  private faces: Face[]; // all the stickers
  private facecentermass: Quat[]; // center of mass of all faces
  private baseFaceCount: BaseFaceCount; // number of base faces
  public stickersperface: number; // number of stickers per face
  public shortedge: number; // number of stickers per face
  private markedface: number[]; // given a bitmap of faces, identify the marked one
  public cubies: number[][]; // the cubies
  private vertexdistance: number; // vertex distance
  private edgedistance: number; // edge distance
  private facetocubie: number[]; // map a face to a cubie index
  private facetoord: number[]; // map a face to a cubie ord
  private moverotations: Quat[][]; // move rotations
  private facelisthash: Map<string, number[]>; // face list by key
  private cubiesetnames: string[]; // cubie set names
  private cubieords: number[]; // the size of each orbit
  private cubiesetnums: number[];
  private cubieordnums: number[];
  private orbitoris: number[]; // the orientation size of each orbit
  private cubievaluemap: number[]; // the map for identical cubies
  private cubiesetcubies: number[][]; // cubies in each cubie set
  public cmovesbyslice: number[][][] = []; // cmoves as perms by slice
  public parsedmovelist: [
    string | undefined,
    number,
    number,
    number,
    boolean,
    number,
  ][]; // parsed move list

  private duplicatedFaces: number[] = []; // which faces are duplicated
  private duplicatedCubies: number[] = []; // which cubies are duplicated
  private fixedCubie: number = -1; // fixed cubie, if any
  private net: string[][] = [];
  private colors: any = [];
  private swizzler: FaceNameSwizzler;
  public notationMapper: NotationMapper = new NullMapper();
  private addNotationMapper: string = "";
  private setReidOrder: boolean = false;

  private options: PuzzleGeometryFullOptions;

  constructor(
    public puzzleDescription: PuzzleDescription,
    options: PuzzleGeometryOptions,
  ) {
    const t1 = tstart("genperms");
    this.options = new PuzzleGeometryFullOptions(options);
    if (this.options.verbosity > 0) {
      console.log(this.header("# "));
    }
    this.create(puzzleDescription);
    tend(t1);
  }

  public create(puzzleDescription: PuzzleDescription): void {
    const { shape, cuts } = puzzleDescription;

    // create the shape, doing all the essential geometry
    // create only goes far enough to figure out how many stickers per
    // face, and what the short edge is.  If the short edge is too short,
    // we probably don't want to display or manipulate this one.  How
    // short is too short is hard to say.
    this.moveplanes = [];
    this.moveplanes2 = [];
    this.faces = [];
    this.cubies = [];
    let g = null;
    switch (shape) {
      case "c": {
        g = cube();
        break;
      }
      case "o": {
        g = octahedron();
        break;
      }
      case "i": {
        g = icosahedron();
        break;
      }
      case "t": {
        g = tetrahedron();
        break;
      }
      case "d": {
        g = dodecahedron();
        break;
      }
      default:
        throw new Error(`Bad shape argument: ${shape}`);
    }
    this.rotations = closure(g);
    if (this.options.verbosity) {
      console.log(`# Rotations: ${this.rotations.length}`);
    }
    const baseplane = g[0];
    this.baseplanerot = uniqueplanes(baseplane, this.rotations);
    const baseplanes = this.baseplanerot.map((_) => baseplane.rotateplane(_));
    this.baseplanes = baseplanes;
    this.baseFaceCount = baseplanes.length as BaseFaceCount;
    const net = defaultnets()[baseplanes.length];
    this.net = net;
    this.colors = defaultPlatonicColorSchemes()[baseplanes.length];
    if (this.options.verbosity > 0) {
      console.log(`# Base planes: ${baseplanes.length}`);
    }
    const baseface = getface(baseplanes);
    const zero = new Quat(0, 0, 0, 0);
    if (this.options.verbosity > 0) {
      console.log(`# Face vertices: ${baseface.length}`);
    }
    const facenormal = baseplanes[0].makenormal();
    const edgenormal = baseface[0].sum(baseface[1]).makenormal();
    const vertexnormal = baseface[0].makenormal();
    const boundary = new Quat(1, facenormal.b, facenormal.c, facenormal.d);
    if (this.options.verbosity > 0) {
      console.log(`# Boundary is ${boundary}`);
    }
    const planerot = uniqueplanes(boundary, this.rotations);
    const planes = planerot.map((_) => boundary.rotateplane(_));
    const firstface = getface(planes);
    this.edgedistance = firstface[0].sum(firstface[1]).smul(0.5).dist(zero);
    this.vertexdistance = firstface[0].dist(zero);
    const cutplanes = [];
    const intersects = [];
    let sawface = false; // what cuts did we see?
    let sawedge = false;
    let sawvertex = false;
    for (const cut of cuts) {
      let normal = null;
      let distance = 0;
      switch (cut.cutType) {
        case "f": {
          normal = facenormal;
          distance = 1;
          sawface = true;
          break;
        }
        case "v": {
          normal = vertexnormal;
          distance = this.vertexdistance;
          sawvertex = true;
          break;
        }
        case "e": {
          normal = edgenormal;
          distance = this.edgedistance;
          sawedge = true;
          break;
        }
        default:
          throw new Error(`Bad cut argument: ${cut.cutType}`);
      }
      cutplanes.push(normal.makecut(cut.distance));
      intersects.push(cut.distance < distance);
    }
    if (this.options.addRotations) {
      if (!sawface) {
        cutplanes.push(facenormal.makecut(10));
      }
      if (!sawvertex) {
        cutplanes.push(vertexnormal.makecut(10));
      }
      if (!sawedge) {
        cutplanes.push(edgenormal.makecut(10));
      }
    }
    this.basefaces = [];
    for (const baseplanerot of this.baseplanerot) {
      const face = baseplanerot.rotateface(firstface);
      this.basefaces.push(new Face(face));
    }
    //
    //   Determine names for edges, vertices, and planes.  Planes are defined
    //   by the plane normal/distance; edges are defined by the midpoint;
    //   vertices are defined by actual point.  In each case we define a name.
    //   Note that edges have two potential names, and corners have n! where
    //   n planes meet at a vertex.  We set names by choosing the marked face
    //   first, and going counterclockwise around.
    //
    const facenames: [Quat[], string][] = [];
    const faceplanes: [Quat, string][] = [];
    const vertexnames: any[] = [];
    const edgenames: any[] = [];
    const edgesperface = firstface.length;
    function searchaddelement(a: any[], p: Quat, name: any): void {
      for (const el of a) {
        if (el[0].dist(p) < eps) {
          el.push(name);
          return;
        }
      }
      a.push([p, name]);
    }
    for (let i = 0; i < this.baseplanerot.length; i++) {
      const face = this.baseplanerot[i].rotateface(firstface);
      for (let j = 0; j < face.length; j++) {
        const jj = (j + 1) % face.length;
        const midpoint = face[j].sum(face[jj]).smul(0.5);
        searchaddelement(edgenames, midpoint, i);
      }
    }
    const otherfaces = [];
    for (let i = 0; i < this.baseplanerot.length; i++) {
      const face = this.baseplanerot[i].rotateface(firstface);
      const facelist = [];
      for (let j = 0; j < face.length; j++) {
        const jj = (j + 1) % face.length;
        const midpoint = face[j].sum(face[jj]).smul(0.5);
        const el = edgenames[findelement(edgenames, midpoint)];
        if (i === el[1]) {
          facelist.push(el[2]);
        } else if (i === el[2]) {
          facelist.push(el[1]);
        } else {
          throw new Error("Could not find edge");
        }
      }
      otherfaces.push(facelist);
    }
    const facenametoindex: any = {};
    const faceindextoname: string[] = [];
    faceindextoname.push(net[0][0]);
    facenametoindex[net[0][0]] = 0;
    faceindextoname[otherfaces[0][0]] = net[0][1];
    facenametoindex[net[0][1]] = otherfaces[0][0];
    for (const neti of net) {
      const f0 = neti[0];
      const fi = facenametoindex[f0];
      if (fi === undefined) {
        throw new Error("Bad edge description; first edge not connected");
      }
      let ii = -1;
      for (let j = 0; j < otherfaces[fi].length; j++) {
        const fn2 = faceindextoname[otherfaces[fi][j]];
        if (fn2 !== undefined && fn2 === neti[1]) {
          ii = j;
          break;
        }
      }
      if (ii < 0) {
        throw new Error("First element of a net not known");
      }
      for (let j = 2; j < neti.length; j++) {
        if (neti[j] === "") {
          continue;
        }
        const of = otherfaces[fi][(j + ii - 1) % edgesperface];
        const fn2 = faceindextoname[of];
        if (fn2 !== undefined && fn2 !== neti[j]) {
          throw new Error("Face mismatch in net");
        }
        faceindextoname[of] = neti[j];
        facenametoindex[neti[j]] = of;
      }
    }
    for (let i = 0; i < this.baseplanerot.length; i++) {
      const face = this.baseplanerot[i].rotateface(firstface);
      const faceplane = boundary.rotateplane(this.baseplanerot[i]);
      const facename = faceindextoname[i];
      facenames.push([face, facename]);
      faceplanes.push([faceplane, facename]);
    }
    for (let i = 0; i < this.baseplanerot.length; i++) {
      const face = this.baseplanerot[i].rotateface(firstface);
      const facename = faceindextoname[i];
      for (let j = 0; j < face.length; j++) {
        const jj = (j + 1) % face.length;
        const midpoint = face[j].sum(face[jj]).smul(0.5);
        const jjj = (j + 2) % face.length;
        const midpoint2 = face[jj].sum(face[jjj]).smul(0.5);
        const e1 = findelement(edgenames, midpoint);
        const e2 = findelement(edgenames, midpoint2);
        searchaddelement(vertexnames, face[jj], [facename, e2, e1]);
      }
    }
    this.swizzler = new FaceNameSwizzler(facenames.map((_) => _[1]));
    const sep = this.swizzler.prefixFree ? "" : "_";
    // fix the edge names; use face precedence order
    const oridata = orientationDefaults[this.baseFaceCount];
    const markedface = [];
    for (let i = 0; i < this.baseFaceCount; i++) {
      markedface[1 << i] = i;
    }
    // FIXME  eliminate the duplications below
    {
      const oriprefs = oridata["v"];
      for (const name of oriprefs) {
        const fn = this.swizzler.splitByFaceNames(name);
        let bits = 0;
        for (const i of fn) {
          bits |= 1 << i;
        }
        markedface[bits] = fn[0];
      }
    }
    {
      const oriprefs = oridata["e"];
      for (const name of oriprefs) {
        const fn = this.swizzler.splitByFaceNames(name);
        let bits = 0;
        for (const i of fn) {
          bits |= 1 << i;
        }
        markedface[bits] = fn[0];
      }
    }
    {
      const oriprefs = oridata["c"];
      for (const name of oriprefs) {
        const fn = this.swizzler.splitByFaceNames(name);
        const bits = (1 << fn[0]) | (1 << this.baseFaceCount);
        markedface[bits] = fn[1];
      }
    }
    for (let i = 0; i < edgenames.length; i++) {
      if (edgenames[i].length !== 3) {
        throw new Error(`Bad length in edge names ${edgenames[i]}`);
      }
      const f1 = edgenames[i][1];
      const f2 = edgenames[i][2];
      let c1 = faceindextoname[f1];
      const c2 = faceindextoname[f2];
      const bits = (1 << f1) | (1 << f2);
      if (markedface[bits] === f1) {
        c1 = c1 + sep + c2;
      } else {
        c1 = c2 + sep + c1;
      }
      edgenames[i] = [edgenames[i][0], c1];
    }
    // fix the vertex names; counterclockwise rotations; proper orientation.
    for (let i = 0; i < vertexnames.length; i++) {
      let bits = 0;
      if (vertexnames[i].length < 4) {
        throw new Error("Bad length in vertex names");
      }
      for (let j = 1; j < vertexnames[i].length; j++) {
        bits |= 1 << facenametoindex[vertexnames[i][j][0]];
      }
      const fi = markedface[bits];
      let st = -1;
      for (let j = 1; j < vertexnames[i].length; j++) {
        if (fi === facenametoindex[vertexnames[i][j][0]]) {
          st = j;
        }
      }
      if (st < 0) {
        throw new Error(
          "Internal error; couldn't find face name when fixing corners",
        );
      }
      let r = "";
      for (let j = 1; j < vertexnames[i].length; j++) {
        if (j === 1) {
          r = vertexnames[i][st][0];
        } else {
          r = r + sep + vertexnames[i][st][0];
        }
        for (let k = 1; k < vertexnames[i].length; k++) {
          if (vertexnames[i][st][1] === vertexnames[i][k][2]) {
            st = k;
            break;
          }
        }
      }
      vertexnames[i] = [vertexnames[i][0], r];
    }
    this.markedface = markedface;
    if (this.options.verbosity > 1) {
      console.log(`# Face names: ${facenames.map((_) => _[1]).join(" ")}`);
      // TODO
      console.log(`# Edge names: ${edgenames.map((_) => _[1]).join(" ")}`);
      // TODO
      console.log(`# Vertex names: ${vertexnames.map((_) => _[1]).join(" ")}`);
    }
    const geonormals: [Quat, string, string][] = [];
    for (const faceplane of faceplanes) {
      geonormals.push([faceplane[0].makenormal(), faceplane[1], "f"]);
    }
    for (const edgename of edgenames) {
      geonormals.push([edgename[0].makenormal(), edgename[1], "e"]);
    }
    for (const vertexname of vertexnames) {
      geonormals.push([vertexname[0].makenormal(), vertexname[1], "v"]);
    }
    this.facenames = facenames;
    this.faceplanes = faceplanes;
    this.edgenames = edgenames;
    this.vertexnames = vertexnames;
    this.geonormals = geonormals;
    const geonormalnames = geonormals.map((_) => _[1]);
    this.swizzler.setGripNames(geonormalnames);
    if (this.options.verbosity > 0) {
      console.log(
        `# Distances: face ${1} edge ${this.edgedistance} vertex ${
          this.vertexdistance
        }`,
      );
    }
    // expand cutplanes by rotations.  We only work with one face here.
    for (let c = 0; c < cutplanes.length; c++) {
      for (const rotation of this.rotations) {
        const q = cutplanes[c].rotateplane(rotation);
        let wasseen = false;
        for (const moveplane of this.moveplanes) {
          if (q.sameplane(moveplane)) {
            wasseen = true;
            break;
          }
        }
        if (!wasseen) {
          this.moveplanes.push(q);
          if (intersects[c]) {
            this.moveplanes2.push(q);
          }
        }
      }
    }
    let ft = new FaceTree(firstface);
    const tar = this.moveplanes2.slice();
    // we want to use Math.random() here but we can't, because when
    // we call multiple times we'll get different orbits/layouts.
    // to resolve this, we use a very simple linear congruential
    // generator.  for our purposes, the numbers don't need to be
    // very random.
    let rval = 31;
    for (let i = 0; i < tar.length; i++) {
      const j = i + Math.floor((tar.length - i) * (rval / 65536.0));
      ft = ft.split(tar[j]);
      tar[j] = tar[i];
      rval = (rval * 1657 + 101) % 65536;
    }
    const faces = ft.collect([], true);
    this.faces = faces;
    if (this.options.verbosity > 0) {
      console.log(`# Faces is now ${faces.length}`);
    }
    this.stickersperface = faces.length;
    // the faces when rotated don't preserve the vertex order at this
    // point.  to improve 3d rendering speed, we would like to preserve
    // vertex order on rotation.  First, let's see what rotations preserve
    // the base face; these are the ones we want to work with.
    const simplerot: Quat[] = [];
    const cm = centermassface(firstface);
    for (const rotation of this.rotations) {
      const f = rotation.rotateface(firstface);
      if (cm.dist(centermassface(f)) < eps) {
        simplerot.push(rotation);
      }
    }
    const finished = new Array<boolean>(faces.length);
    const sortme: [number, Quat, number][] = [];
    for (let i = 0; i < faces.length; i++) {
      const cm2 = faces[i].centermass();
      sortme.push([cm.dist(cm2), cm2, i]);
    }
    sortme.sort((a, b) => a[0] - b[0]);
    for (let ii = 0; ii < faces.length; ii++) {
      const i = sortme[ii][2];
      if (!finished[i]) {
        finished[i] = true;
        for (const rot of simplerot) {
          const f2 = faces[i].rotate(rot);
          const cm = f2.centermass();
          for (let kk = ii + 1; kk < faces.length; kk++) {
            if (sortme[kk][0] - sortme[ii][0] > eps) {
              break;
            }
            const k = sortme[kk][2];
            if (!finished[k] && cm.dist(sortme[kk][1]) < eps) {
              finished[k] = true;
              faces[k] = f2;
              break;
            }
          }
        }
      }
    }
    //  Find and report the shortest edge in any of the faces.  If this
    //  is small the puzzle is probably not practical or displayable.
    this.shortedge = 1e99;
    for (const face of faces) {
      for (let j = 0; j < face.length; j++) {
        const k = (j + 1) % face.length;
        const t = face.get(j).dist(face.get(k));
        if (t < this.shortedge) {
          this.shortedge = t;
        }
      }
    }
    if (this.options.verbosity > 0) {
      console.log(`# Short edge is ${this.shortedge}`);
    }
    // add nxnxn cube notation if it has cube face moves
    if (shape === "c" && sawface && !sawedge && !sawvertex) {
      // In this case the mapper adding is deferred until we
      // know the number of slices.
      this.addNotationMapper = "NxNxNCubeMapper";
      // try to set Reid order of the cubies within an orbit
      this.setReidOrder = true;
    }
    if (shape === "c" && sawvertex && !sawface && !sawedge) {
      this.addNotationMapper = "SkewbMapper";
    }
    if (shape === "t" && (sawvertex || sawface) && !sawedge) {
      this.addNotationMapper = "PyraminxOrTetraminxMapper";
    }
    if (shape === "o" && sawface) {
      this.notationMapper = new FaceRenamingMapper(
        this.swizzler,
        new FaceNameSwizzler(["F", "D", "L", "BL", "R", "U", "BR", "B"]),
      );
      if (!(sawedge || sawvertex)) {
        this.addNotationMapper = "FTOMapper";
      }
    }
    if (shape === "d" && sawface) {
      this.addNotationMapper = "MegaminxMapper";
      this.notationMapper = new FaceRenamingMapper(
        this.swizzler,
        new FaceNameSwizzler([
          "U",
          "F",
          "L",
          "BL",
          "BR",
          "R",
          "FR",
          "FL",
          "DL",
          "B",
          "DR",
          "D",
        ]),
      );
    }
  }

  private keyface(face: Face): string {
    return this.keyface2(face.centermass());
  }

  private keyface2(cm: Quat): string {
    // take a face and figure out the sides of each move plane
    let s = "";
    const sfcc = String.fromCharCode;
    for (const moveplaneset of this.moveplanesets) {
      if (moveplaneset.length > 0) {
        const dv = cm.dot(moveplaneset[0]);
        let t = 0;
        let b = 1;
        while (b * 2 <= moveplaneset.length) {
          b *= 2;
        }
        for (; b > 0; b >>= 1) {
          if (t + b <= moveplaneset.length && dv > moveplaneset[t + b - 1].a) {
            t += b;
          }
        }
        if (t < 47) {
          s = s + sfcc(33 + t);
        } else if (t < 47 + 47 * 47) {
          s = s + sfcc(33 + 47 + Math.floor(t / 47) - 1) + sfcc(33 + (t % 47));
        } else if (t < 47 + 47 * 47 + 47 * 47 * 47) {
          s =
            s +
            sfcc(33 + 47 + Math.floor((t - 47) / (47 * 47) - 1)) +
            sfcc(33 + 47 + (Math.floor((t - 47) / 47) % 47)) +
            sfcc(33 + (t % 47));
        } else {
          throw Error("Too many slices for cubie encoding");
        }
      }
    }
    return s;
  }

  // same as above, but instead of returning an encoded string, return
  // an array with offsets.
  private keyface3(face: Face): number[] {
    const cm = face.centermass();
    // take a face and figure out the sides of each move plane
    const r = [];
    for (const moveplaneset of this.moveplanesets) {
      if (moveplaneset.length > 0) {
        const dv = cm.dot(moveplaneset[0]);
        let t = 0;
        let b = 1;
        while (b * 2 <= moveplaneset.length) {
          b *= 2;
        }
        for (; b > 0; b >>= 1) {
          if (t + b <= moveplaneset.length && dv > moveplaneset[t + b - 1].a) {
            t += b;
          }
        }
        r.push(t);
      }
    }
    return r;
  }

  private findface(cm: Quat): number {
    const key = this.keyface2(cm);
    const arr = this.facelisthash.get(key)!;
    if (arr.length === 1) {
      return arr[0];
    }
    for (let i = 0; i + 1 < arr.length; i++) {
      const face2 = this.facelisthash.get(key)![i];
      if (Math.abs(cm.dist(this.facecentermass[face2])) < eps) {
        return face2;
      }
    }
    return arr[arr.length - 1];
  }

  private project2d(
    facen: number,
    edgen: number,
    targvec: Quat[],
  ): [Quat, Quat, Quat] {
    // calculate geometry to map a particular edge of a particular
    //  face to a given 2D vector.  The face is given as an index into the
    //  facenames/baseplane arrays, and the edge is given as an offset into
    //  the vertices.
    const face = this.facenames[facen][0];
    const edgen2 = (edgen + 1) % face.length;
    const plane = this.baseplanes[facen];
    let x0 = face[edgen2].sub(face[edgen]);
    const olen = x0.len();
    x0 = x0.normalize();
    const y0 = x0.cross(plane).normalize();
    let delta = targvec[1].sub(targvec[0]);
    const len = delta.len() / olen;
    delta = delta.normalize();
    const cosr = delta.b;
    const sinr = delta.c;
    const x1 = x0.smul(cosr).sub(y0.smul(sinr)).smul(len);
    const y1 = y0.smul(cosr).sum(x0.smul(sinr)).smul(len);
    const off = new Quat(
      0,
      targvec[0].b - x1.dot(face[edgen]),
      targvec[0].c - y1.dot(face[edgen]),
      0,
    );
    return [x1, y1, off];
  }

  public allstickers(): void {
    const t1 = tstart("allstickers");
    // next step is to calculate all the stickers and orbits
    // We do enough work here to display the cube on the screen.
    // take our newly split base face and expand it by the rotation matrix.
    // this generates our full set of "stickers".
    this.faces = expandfaces(this.baseplanerot, this.faces);
    if (this.options.verbosity > 0) {
      console.log(`# Total stickers is now ${this.faces.length}`);
    }
    this.facecentermass = new Array(this.faces.length);
    for (let i = 0; i < this.faces.length; i++) {
      this.facecentermass[i] = this.faces[i].centermass();
    }
    // Split moveplanes into a list of parallel planes.
    const moveplanesets: Quat[][] = [];
    const moveplanenormals: Quat[] = [];
    // get the normals, first, from unfiltered moveplanes.
    for (const q of this.moveplanes) {
      const qnormal = q.makenormal();
      let wasseen = false;
      for (const moveplanenormal of moveplanenormals) {
        if (qnormal.sameplane(moveplanenormal.makenormal())) {
          wasseen = true;
        }
      }
      if (!wasseen) {
        moveplanenormals.push(qnormal);
        moveplanesets.push([]);
      }
    }
    for (const q of this.moveplanes2) {
      const qnormal = q.makenormal();
      for (let j = 0; j < moveplanenormals.length; j++) {
        if (qnormal.sameplane(moveplanenormals[j])) {
          moveplanesets[j].push(q);
          break;
        }
      }
    }
    // make the normals all face the same way in each set.
    for (let i = 0; i < moveplanesets.length; i++) {
      const q: Quat[] = moveplanesets[i].map((_) => _.normalizeplane());
      const goodnormal = moveplanenormals[i];
      for (let j = 0; j < q.length; j++) {
        if (q[j].makenormal().dist(goodnormal) > eps) {
          q[j] = q[j].smul(-1);
        }
      }
      q.sort((a, b) => a.a - b.a);
      moveplanesets[i] = q;
    }
    this.moveplanesets = moveplanesets;
    this.moveplanenormals = moveplanenormals;
    const sizes = moveplanesets.map((_) => _.length);
    if (this.options.verbosity > 0) {
      console.log(`# Move plane sets: ${sizes}`);
    }
    // for each of the move planes, find the rotations that are relevant
    const moverotations: Quat[][] = [];
    for (let i = 0; i < moveplanesets.length; i++) {
      moverotations.push([]);
    }
    for (const q of this.rotations) {
      if (Math.abs(Math.abs(q.a) - 1) < eps) {
        continue;
      }
      const qnormal = q.makenormal();
      for (let j = 0; j < moveplanesets.length; j++) {
        if (qnormal.sameplane(moveplanenormals[j])) {
          moverotations[j].push(q);
          break;
        }
      }
    }
    this.moverotations = moverotations;
    //  Sort the rotations by the angle of rotation.  A bit tricky because
    //  while the norms should be the same, they need not be.  So we start
    //  by making the norms the same, and then sorting.
    for (let i = 0; i < moverotations.length; i++) {
      const r = moverotations[i];
      const goodnormal = r[0].makenormal();
      for (let j = 0; j < r.length; j++) {
        if (goodnormal.dist(r[j].makenormal()) > eps) {
          r[j] = r[j].smul(-1);
        }
      }
      r.sort((a, b) => a.angle() - b.angle());
      if (moverotations[i][0].dot(moveplanenormals[i]) < 0) {
        r.reverse();
      }
    }
    const sizes2 = moverotations.map((_) => 1 + _.length);
    this.movesetorders = sizes2;
    const movesetgeos: MoveSetGeo[] = [];
    let gtype = "?";
    for (let i = 0; i < moveplanesets.length; i++) {
      const p0 = moveplanenormals[i];
      let neg = null;
      let pos = null;
      for (const geonormal of this.geonormals) {
        const d = p0.dot(geonormal[0]);
        if (Math.abs(d - 1) < eps) {
          pos = [geonormal[1], geonormal[2]];
          gtype = geonormal[2];
        } else if (Math.abs(d + 1) < eps) {
          neg = [geonormal[1], geonormal[2]];
          gtype = geonormal[2];
        }
      }
      if (pos === null || neg === null) {
        throw new Error("Saw positive or negative sides as null");
      }
      movesetgeos.push([
        pos[0],
        pos[1],
        neg[0],
        neg[1],
        1 + moveplanesets[i].length,
      ]);
      if (this.addNotationMapper === "NxNxNCubeMapper" && gtype === "f") {
        this.notationMapper = new NxNxNCubeMapper(1 + moveplanesets[i].length);
        this.addNotationMapper = "";
      }
      if (
        this.addNotationMapper === "SkewbMapper" &&
        moveplanesets[0].length === 1
      ) {
        this.notationMapper = new SkewbNotationMapper(this.swizzler);
        this.addNotationMapper = "";
      }
      if (this.addNotationMapper === "PyraminxOrTetraminxMapper") {
        if (
          moveplanesets[0].length === 2 &&
          moveplanesets[0][0].a === 0.333333333333333 &&
          moveplanesets[0][1].a === 1.66666666666667
        ) {
          this.notationMapper = new PyraminxNotationMapper(this.swizzler);
          this.addNotationMapper = "";
        } else {
          this.notationMapper = new TetraminxNotationMapper(this.swizzler);
          this.addNotationMapper = "";
        }
      }
      if (this.addNotationMapper === "MegaminxMapper" && gtype === "f") {
        if (1 + moveplanesets[i].length === 3) {
          this.notationMapper = new MegaminxScramblingNotationMapper(
            this.notationMapper,
          );
        }
        this.addNotationMapper = "";
      }
      if (this.addNotationMapper === "FTOMapper" && gtype === "f") {
        if (1 + moveplanesets[i].length === 3) {
          this.notationMapper = new FTONotationMapper(
            this.notationMapper,
            this.swizzler,
          );
        }
        this.addNotationMapper = "";
      }
    }
    this.movesetgeos = movesetgeos;
    //  Cubies are split by move plane sets.  For each cubie we can
    //  average its points to find a point on the interior of that
    //  cubie.  We can then check that point against all the move
    //  planes and from that derive a coordinate for the cubie.
    //  This also works for faces; no face should ever lie on a move
    //  plane.  This allows us to take a set of stickers and break
    //  them up into cubie sets.
    const facelisthash = new Map();
    const faces = this.faces;
    for (let i = 0; i < faces.length; i++) {
      const face = faces[i];
      const s = this.keyface(face);
      if (!facelisthash.get(s)) {
        facelisthash.set(s, [i]);
      } else {
        const arr = facelisthash.get(s)!;
        arr.push(i);
        //  If we find a core cubie, split it up into multiple cubies,
        //  because ksolve doesn't handle orientations that are not
        //  cyclic, and the rotation group of the core is not cyclic.
        if (arr.length === this.baseFaceCount) {
          if (this.options.verbosity > 0) {
            console.log("# Splitting core.");
          }
          for (let suff = 0; suff < arr.length; suff++) {
            const s2 = `${s} ${suff}`;
            facelisthash.set(s2, [arr[suff]]);
          }
        }
      }
    }
    this.facelisthash = facelisthash;
    if (this.options.verbosity > 0) {
      console.log(`# Cubies: ${facelisthash.size}`);
    }
    const cubies: number[][] = [];
    const facetocubie = [];
    const facetoord = [];
    for (const facelist of facelisthash.values()) {
      if (facelist.length === this.baseFaceCount) {
        // this is the original "cubie" of a split core; we ignore it.
        continue;
      }
      //  Sort the faces around each corner so they are counterclockwise.  Only
      //  relevant for cubies that actually are corners (three or more
      //  faces).  In general cubies might have many faces; for icosohedrons
      //  there are five faces on the corner cubies.
      if (facelist.length > 1) {
        const cm = facelist.map((_: number) => faces[_].centermass());
        const cmall = centermassface(cm);
        for (let looplimit = 0; facelist.length > 2; looplimit++) {
          let changed = false;
          for (let i = 0; i < facelist.length; i++) {
            const j = (i + 1) % facelist.length;
            // var ttt = cmall.dot(cm[i].cross(cm[j])) ; // TODO
            if (cmall.dot(cm[i].cross(cm[j])) < 0) {
              const u = cm[i];
              cm[i] = cm[j];
              cm[j] = u;
              const v = facelist[i];
              facelist[i] = facelist[j];
              facelist[j] = v;
              changed = true;
            }
          }
          if (!changed) {
            break;
          }
          if (looplimit > 1000) {
            throw new Error("Bad epsilon math; too close to border");
          }
        }
        // set the orientations by finding the marked face and putting it first.
        let bits = 0;
        for (const f of facelist) {
          bits |= 1 << Math.floor(f / this.stickersperface);
        }
        const markedface = this.markedface[bits]!;
        let mini = -1;
        for (let i = 0; i < facelist.length; i++) {
          if (Math.floor(facelist[i] / this.stickersperface) === markedface) {
            mini = i;
          }
        }
        if (mini < 0) {
          throw new Error("Could not find marked face in list");
        }
        if (mini !== 0) {
          const ofacelist = facelist.slice();
          for (let i = 0; i < facelist.length; i++) {
            facelist[i] = ofacelist[(mini + i) % facelist.length];
          }
        }
      }
      for (let j = 0; j < facelist.length; j++) {
        const k = facelist[j];
        facetocubie[k] = cubies.length;
        facetoord[k] = j;
      }
      cubies.push(facelist);
    }
    this.cubies = cubies;
    this.facetocubie = facetocubie;
    this.facetoord = facetoord;
    //  Calculate the orbits of each cubie.  Assumes we do all moves.
    //  Also calculates which cubies are identical.
    const typenames = ["?", "CENTERS", "EDGES", "CORNERS", "C4RNER", "C5RNER"];
    const cubiesetnames = [];
    const cubietypecounts = [0, 0, 0, 0, 0, 0];
    const orbitoris = [];
    const seen = [];
    let cubiesetnum = 0;
    const cubiesetnums = [];
    const cubieordnums = [];
    const cubieords = [];
    const cubievaluemap = [];
    // Later we will make this smarter to use a get color for face function
    // so we support puzzles with multiple faces the same color
    const getcolorkey = (cubienum: number): string => {
      return cubies[cubienum].map((_) => this.getfaceindex(_)).join(" ");
    };
    const cubiesetcubies: any = [];
    for (let i = 0; i < cubies.length; i++) {
      const cubie = cubies[i];
      if (cubie.length === 0) {
        continue;
      }
      if (seen[i]) {
        continue;
      }
      const cubiekeymap: any = {};
      let cubievalueid = 0;
      cubieords.push(0);
      cubiesetcubies.push([]);
      const facecnt = cubie.length;
      const typectr = cubietypecounts[facecnt]++;
      let typename = typenames[facecnt];
      if (typename === undefined || facecnt === this.baseFaceCount) {
        typename = "CORE";
      }
      typename = typename + (typectr === 0 ? "" : typectr + 1);
      cubiesetnames[cubiesetnum] = typename;
      orbitoris[cubiesetnum] = facecnt;
      const queue = [i];
      let qg = 0;
      seen[i] = true;
      while (qg < queue.length) {
        const cind = queue[qg++];
        const cubiecolorkey = getcolorkey(cind);
        if (cubie.length > 1 || cubiekeymap[cubiecolorkey] === undefined) {
          cubiekeymap[cubiecolorkey] = cubievalueid++;
        }
        cubievaluemap[cind] = cubiekeymap[cubiecolorkey];
        cubiesetnums[cind] = cubiesetnum;
        cubiesetcubies[cubiesetnum].push(cind);
        cubieordnums[cind] = cubieords[cubiesetnum]++;
        if (queue.length < this.rotations.length) {
          const cm = this.facecentermass[cubies[cind][0]];
          for (const moverotation of moverotations) {
            const tq =
              this.facetocubie[this.findface(cm.rotatepoint(moverotation[0]))];
            if (!seen[tq]) {
              queue.push(tq);
              seen[tq] = true;
            }
          }
        }
      }
      cubiesetnum++;
    }
    if (
      this.setReidOrder &&
      4 <= this.stickersperface &&
      this.stickersperface <= 9
    ) {
      const reidorder = [
        [
          "UF",
          "UR",
          "UB",
          "UL",
          "DF",
          "DR",
          "DB",
          "DL",
          "FR",
          "FL",
          "BR",
          "BL",
        ],
        ["UFR", "URB", "UBL", "ULF", "DRF", "DFL", "DLB", "DBR"],
        ["U", "L", "F", "R", "B", "D"],
      ];
      const reidmap: { [key: number]: number } = {};
      for (const cubie of reidorder) {
        for (let j = 0; j < cubie.length; j++) {
          let mask = 0;
          for (let k = 0; k < cubie[j].length; k++) {
            mask |= 1 << (cubie[j].charCodeAt(k) - 65);
          }
          reidmap[mask] = j;
        }
      }
      for (const cubieset of cubiesetcubies) {
        for (const cubienum of cubieset) {
          let mask = 0;
          for (const cubie of cubies[cubienum]) {
            mask |=
              1 <<
              (this.facenames[this.getfaceindex(cubie)][1].charCodeAt(0) - 65);
          }
          cubieordnums[cubienum] = reidmap[mask];
        }
      }
    }
    this.cubiesetnums = cubiesetnums;
    this.cubieordnums = cubieordnums;
    this.cubiesetnames = cubiesetnames;
    this.cubieords = cubieords;
    this.orbitoris = orbitoris;
    this.cubievaluemap = cubievaluemap;
    this.cubiesetcubies = cubiesetcubies;
    // if we fix a cubie, find a cubie to fix
    if (this.options.fixedPieceType !== null) {
      for (let i = 0; i < cubies.length; i++) {
        if (
          (this.options.fixedPieceType === "v" && cubies[i].length > 2) ||
          (this.options.fixedPieceType === "e" && cubies[i].length === 2) ||
          (this.options.fixedPieceType === "f" && cubies[i].length === 1)
        ) {
          this.fixedCubie = i;
          break;
        }
      }
      if (this.fixedCubie < 0) {
        throw new Error(
          `Could not find a cubie of type ${this.options.fixedPieceType} to fix.`,
        );
      }
    }
    // show the orbits
    if (this.options.verbosity > 0) {
      console.log(`# Cubie orbit sizes ${cubieords}`);
    }
    tend(t1);
  }

  public unswizzle(mv: Move): Move | null {
    const newmv = this.notationMapper.notationToInternal(mv);
    if (newmv === null) {
      return null;
    }
    return newmv.modified({ family: this.swizzler.unswizzle(newmv.family) });
  }

  // We use an extremely permissive parse here; any character but
  // digits are allowed in a family name.
  private stringToBlockMove(mv: string): Move {
    // parse a move from the command line
    const re = /^(([0-9]+)-)?([0-9]+)?([^0-9]+)([0-9]+'?)?$/;
    const p = mv.match(re);
    if (p === null) {
      throw new Error(`Bad move passed ${mv}`);
    }
    const grip = p[4];
    let loslice = undefined;
    let hislice = undefined;
    if (p[2] !== undefined) {
      if (p[3] === undefined) {
        throw new Error("Missing second number in range");
      }
      loslice = parseInt(p[2], 10);
    }
    if (p[3] !== undefined) {
      hislice = parseInt(p[3], 10);
    }
    let amountstr = "1";
    let amount = 1;
    if (p[5] !== undefined) {
      amountstr = p[5];
      if (amountstr[0] === "'") {
        amountstr = `-${amountstr.substring(1)}`;
      }
      amount = parseInt(amountstr, 10);
    }
    return new Move(new QuantumMove(grip, hislice, loslice), amount);
  }

  public parseMove(
    move: Move,
  ): [string | undefined, number, number, number, boolean, number] {
    const bm = this.notationMapper.notationToInternal(move); // pluggable notation
    if (bm === null) {
      throw new Error(`Bad move ${move.family}`);
    }
    move = bm;
    let grip = move.family;
    let fullrotation = false;
    if (grip.endsWith("v") && grip[0] <= "Z") {
      if (move.innerLayer !== undefined || move.outerLayer !== undefined) {
        throw new Error("Cannot use a prefix with full cube rotations");
      }
      grip = grip.slice(0, -1);
      fullrotation = true;
    }
    if (grip.endsWith("w") && grip[0] <= "Z") {
      grip = grip.slice(0, -1).toLowerCase();
    }
    let geo: MoveSetGeo | undefined;
    let msi = -1;
    const geoname = this.swizzler.unswizzle(grip);
    let firstgrip = false;
    for (let i = 0; i < this.movesetgeos.length; i++) {
      const g = this.movesetgeos[i];
      if (geoname === g[0]) {
        firstgrip = true;
        geo = g;
        msi = i;
      }
      if (geoname === g[2]) {
        firstgrip = false;
        geo = g;
        msi = i;
      }
    }
    let loslice = 1;
    let hislice = 1;
    if (grip.toUpperCase() !== grip) {
      hislice = 2;
    }
    if (geo === undefined) {
      throw new Error(`Bad grip in move ${move.family}`);
    }
    if (move.outerLayer !== undefined) {
      loslice = move.outerLayer;
    }
    if (move.innerLayer !== undefined) {
      if (move.outerLayer === undefined) {
        hislice = move.innerLayer;
        // big assumption here!  if outerlayer not specified, but inner
        // layer is (like 2U), we use the case of the family (upper vs
        // lower) to decide if it should be a slice turn or a wide turn.
        if (grip <= "Z") {
          // uppercase; slice move
          loslice = hislice;
        } else {
          // lowercase; wide move
          loslice = 1;
        }
      } else {
        hislice = move.innerLayer;
      }
    }
    loslice--;
    hislice--;
    if (fullrotation) {
      loslice = 0;
      hislice = this.moveplanesets[msi].length;
    }
    if (
      loslice < 0 ||
      loslice > this.moveplanesets[msi].length ||
      hislice < 0 ||
      hislice > this.moveplanesets[msi].length
    ) {
      throw new Error(
        `Bad slice spec ${loslice} ${hislice} vs ${this.moveplanesets[msi].length}`,
      );
    }
    if (
      !permissivieMoveParsing &&
      loslice === 0 &&
      hislice === this.moveplanesets[msi].length &&
      !fullrotation
    ) {
      throw new Error(
        "! full puzzle rotations must be specified with v suffix.",
      );
    }
    return [undefined, msi, loslice, hislice, firstgrip, move.amount];
  }

  private parsemove(
    mv: string,
  ): [string | undefined, number, number, number, boolean, number] {
    const r = this.parseMove(this.stringToBlockMove(mv));
    r[0] = mv;
    return r;
  }

  public genperms(): void {
    const t1 = tstart("genperms");
    // generate permutations for moves
    if (this.cmovesbyslice.length > 0) {
      // did this already?
      return;
    }
    const cmovesbyslice = [];
    // if orientCenters is set, we find all cubies that have only one
    // sticker and that sticker is in the center of a face, and we
    // introduce duplicate stickers so we can orient them properly.
    //
    //  We also rotate the vertices of the face to enforce the orientation
    //  preferences for the oriented center stickers.
    if (this.options.orientCenters) {
      for (let k = 0; k < this.cubies.length; k++) {
        if (this.cubies[k].length === 1) {
          const kk = this.cubies[k][0];
          const i = this.getfaceindex(kk);
          const center = this.basefaces[i].centermass();
          if (center.dist(this.facecentermass[kk]) < eps) {
            const bits = (1 << i) | (1 << this.baseFaceCount);
            const towards = this.markedface[bits];
            const normal = this.baseplanes[towards].makenormal();
            let hiv = -1;
            let hii = -1;
            for (let ii = 0; ii < this.faces[kk].length; ii++) {
              const pt = this.faces[kk].get(ii);
              const t = normal.dot(pt.sub(center));
              if (t > hiv) {
                hiv = t;
                hii = ii;
              }
            }
            // if two pts have the same distance, prefer the second
            const hii2 = (hii + 1) % this.faces[kk].length;
            if (
              Math.abs(normal.dot(this.faces[kk].get(hii2).sub(center)) - hiv) <
              eps
            ) {
              hii = hii2;
            }
            // remake the face to preserve orientations
            if (hii !== 0) {
              const qs = [];
              for (let ii = 0; ii < this.faces[kk].length; ii++) {
                qs.push(this.faces[kk].get((ii + hii) % this.faces[kk].length));
              }
              this.faces[kk] = new Face(qs);
            }
            const o = this.basefaces[i].length;
            for (let m = 1; m < o; m++) {
              this.cubies[k].push(this.cubies[k][m - 1]);
            }
            this.duplicatedFaces[kk] = o;
            this.duplicatedCubies[k] = o;
            this.orbitoris[this.cubiesetnums[k]] = o;
          }
        }
      }
    }
    for (let k = 0; k < this.moveplanesets.length; k++) {
      const moveplaneset = this.moveplanesets[k];
      const slicenum = [];
      const slicecnts = [moveplaneset.length + 1, 0];
      let bhi = 1;
      while (bhi * 2 <= moveplaneset.length) {
        bhi *= 2;
      }
      for (let i = 0; i < this.faces.length; i++) {
        let t = 0;
        if (moveplaneset.length > 0) {
          const dv = this.facecentermass[i].dot(moveplaneset[0]);
          for (let b = bhi; b > 0; b >>= 1) {
            if (
              t + b <= moveplaneset.length &&
              dv > moveplaneset[t + b - 1].a
            ) {
              t += b;
            }
          }
          t = moveplaneset.length - t;
        }
        slicenum.push(t);
        while (slicecnts.length <= t) {
          slicecnts.push(0);
        }
        slicecnts[t]++;
      }
      const axiscmoves = new Array(slicecnts.length);
      for (let sc = 0; sc < slicecnts.length; sc++) {
        axiscmoves[sc] = [];
      }
      const cubiedone = [];
      for (let i = 0; i < this.faces.length; i++) {
        if (slicenum[i] < 0) {
          continue;
        }
        const b = [this.facetocubie[i], this.facetoord[i]];
        let cm = this.facecentermass[i];
        const ocm = cm;
        let fi2 = i;
        const sc = slicenum[fi2];
        for (;;) {
          slicenum[fi2] = -1;
          const cm2 = cm.rotatepoint(this.moverotations[k][0]);
          if (cm2.dist(ocm) < eps) {
            break;
          }
          fi2 = this.findface(cm2);
          b.push(this.facetocubie[fi2], this.facetoord[fi2]);
          cm = cm2;
        }
        // If an oriented center is moving, we need to figure out
        // the appropriate new orientation.  Normally we use the cubie
        // sticker identity to locate, but this doesn't work here.
        // Instead we need to redo the geometry of the sticker itself
        // rotating and figure out how that maps to the destination
        // sticker.
        //
        // We only need to do this for central center stickers: those
        // where the face vertex goes through the center.  The others
        // don't actually need orientation because they can only be
        // in one orientation by physical constraints.  (You can't spin
        // a point or cross sticker on the 5x5x5, for example.)
        //
        // This also simplifies things because it means the actual
        // remapping has the same order as the moves themselves.
        //
        // The center may or may not have been duplicated at this point.
        //
        // The move moving the center might not be the same modulo as the
        // center itself.
        if (
          b.length > 2 &&
          this.options.orientCenters &&
          (this.cubies[b[0]].length === 1 || this.duplicatedCubies[b[0]] > 1)
        ) {
          // is this a real center cubie, around an axis?
          if (
            this.facecentermass[i].dist(
              this.basefaces[this.getfaceindex(i)].centermass(),
            ) < eps
          ) {
            // how does remapping of the face/point set map to the original?
            let face1 = this.faces[this.cubies[b[0]][0]];
            for (let ii = 0; ii < b.length; ii += 2) {
              const face0 = this.faces[this.cubies[b[ii]][0]];
              let o = -1;
              for (let jj = 0; jj < face1.length; jj++) {
                if (face0.get(jj).dist(face1.get(0)) < eps) {
                  o = jj;
                  break;
                }
              }
              if (o < 0) {
                throw new Error(
                  "Couldn't find rotation of center faces; ignoring for now.",
                );
              } else {
                b[ii + 1] = o;
                face1 = face1.rotate(this.moverotations[k][0]);
              }
            }
          }
        }
        // b.length === 2 means a sticker is spinning in place.
        // in this case we add duplicate stickers
        // so that we can make it animate properly in a 3D world.
        if (b.length === 2 && this.options.orientCenters) {
          const dir = this.facecentermass[i].dot(this.moveplanenormals[k]);
          for (let ii = 1; ii < this.movesetorders[k]; ii++) {
            if (dir > 0) {
              b.push(b[0], ii);
            } else {
              b.push(
                b[0],
                (this.movesetorders[k] - ii) % this.movesetorders[k],
              );
            }
          }
        }
        if (b.length > 2 && !cubiedone[b[0]]) {
          if (b.length !== 2 * this.movesetorders[k]) {
            throw new Error("Bad length in perm gen");
          }
          for (const v of b) {
            axiscmoves[sc].push(v);
          }
        }
        for (let j = 0; j < b.length; j += 2) {
          cubiedone[b[j]] = true;
        }
      }
      for (let kk = 0; kk < axiscmoves.length; kk++) {
        axiscmoves[kk] = axiscmoves[kk].slice();
      }
      cmovesbyslice.push(axiscmoves);
    }
    this.cmovesbyslice = cmovesbyslice;
    if (this.options.moveList) {
      const parsedmovelist: [
        string | undefined,
        number,
        number,
        number,
        boolean,
        number,
      ][] = [];
      // make sure the movelist makes sense based on the geos.
      for (const moveString of this.options.moveList) {
        parsedmovelist.push(this.parsemove(moveString));
      }
      this.parsedmovelist = parsedmovelist;
    }
    this.facelisthash.clear();
    this.facecentermass = [];
    tend(t1);
  }

  private getboundarygeometry(): any {
    // get the boundary geometry
    return {
      baseplanes: this.baseplanes,
      facenames: this.facenames,
      faceplanes: this.faceplanes,
      vertexnames: this.vertexnames,
      edgenames: this.edgenames,
      geonormals: this.geonormals,
    };
  }

  private getmovesets(k: number): any {
    // get the move sets we support based on slices
    // for even values we omit the middle "slice".  This isn't perfect
    // but it is what we do for now.
    // if there was a move list specified, pull values from that
    const slices = this.moveplanesets[k].length;
    let r: any[] = [];
    if (this.parsedmovelist !== undefined) {
      for (const parsedmove of this.parsedmovelist) {
        if (parsedmove[1] !== k) {
          continue;
        }
        if (parsedmove[4]) {
          r.push([parsedmove[2], parsedmove[3]]);
        } else {
          r.push([slices - parsedmove[3], slices - parsedmove[2]]);
        }
        r.push(parsedmove[5]);
      }
    } else {
      const msg = this.movesetgeos[k];
      const isTetrahedron = msg[1] !== msg[3];
      if (this.options.vertexMoves && isTetrahedron && !this.options.allMoves) {
        if (msg[1] !== msg[3]) {
          for (let i = 0; i < slices; i++) {
            if (msg[1] !== "v") {
              if (this.options.outerBlockMoves) {
                r.push([i + 1, slices]);
              } else {
                r.push([i + 1, i + 1]);
              }
              r.push(1);
            } else {
              if (this.options.outerBlockMoves) {
                r.push([0, i]);
              } else {
                r.push([i, i]);
              }
              r.push(1);
            }
          }
        }
      } else {
        for (let i = 0; i <= slices; i++) {
          if (!this.options.allMoves && i + i === slices) {
            continue;
          }
          if (this.options.outerBlockMoves) {
            if (i + i > slices) {
              r.push([i, slices]);
            } else {
              r.push([0, i]);
            }
          } else {
            r.push([i, i]);
          }
          r.push(1);
        }
      }
    }
    if (this.fixedCubie >= 0) {
      const dep = this.keyface3(this.faces[this.cubies[this.fixedCubie][0]])[k];
      const newr = [];
      for (let i = 0; i < r.length; i += 2) {
        let o = r[i];
        if (dep >= o[0] && dep <= o[1]) {
          if (o[0] === 0) {
            o = [o[1] + 1, slices];
          } else if (slices === o[1]) {
            o = [0, o[0] - 1];
          } else {
            throw Error("fixed cubie option would disconnect move");
          }
        }
        let found = false;
        for (let j = 0; j < newr.length; j += 2) {
          if (
            newr[j][0] === o[0] &&
            newr[j][1] === o[1] &&
            newr[j + 1] === r[i + 1]
          ) {
            found = true;
            break;
          }
        }
        if (!found) {
          newr.push(o);
          newr.push(r[i + 1]);
        }
      }
      r = newr;
    }
    // TODO
    return r;
  }

  private graybyori(cubie: number): boolean {
    let ori = this.cubies[cubie].length;
    if (this.duplicatedCubies[cubie]) {
      ori = 1;
    }
    return (
      (ori === 1 &&
        (this.options.grayCenters || !this.options.includeCenterOrbits)) ||
      (ori === 2 &&
        (this.options.grayEdges || !this.options.includeEdgeOrbits)) ||
      (ori > 2 &&
        (this.options.grayCorners || !this.options.includeCornerOrbits))
    );
  }

  private skipbyori(cubie: number): boolean {
    let ori = this.cubies[cubie].length;
    if (this.duplicatedCubies[cubie]) {
      ori = 1;
    }
    return (
      (ori === 1 && !this.options.includeCenterOrbits) ||
      (ori === 2 && !this.options.includeEdgeOrbits) ||
      (ori > 2 && !this.options.includeCornerOrbits)
    );
  }

  private skipcubie(fi: number): boolean {
    return this.skipbyori(fi);
  }

  private header(comment: string): string {
    return `${comment + copyright}\n${comment}\n`;
  }

  public writegap(): string {
    // write out a gap set of generators
    const os = this.getOrbitsDef(false);
    const r = [];
    const mvs = [];
    for (let i = 0; i < os.moveops.length; i++) {
      let movename = `M_${externalName(this.notationMapper, os.movenames[i])}`;
      let doinv = false;
      if (movename[movename.length - 1] === "'") {
        movename = movename.substring(0, movename.length - 1);
        doinv = true;
      }
      // gap doesn't like angle brackets in IDs
      mvs.push(movename);
      if (doinv) {
        r.push(`${movename}:=${os.moveops[i].toPerm().inv().toGap()};`);
      } else {
        r.push(`${movename}:=${os.moveops[i].toPerm().toGap()};`);
      }
    }
    r.push("Gen:=[");
    r.push(mvs.join(","));
    r.push("];");
    const ip = os.solved.identicalPieces();
    r.push(
      `ip:=[${ip
        .map((_) => `[${_.map((__) => __ + 1).join(",")}]`)
        .join(",")}];`,
    );
    r.push("# Size(Group(Gen));");
    r.push("# Size(Stabilizer(Group(Gen), ip, OnTuplesSets));");
    r.push("");
    return this.header("# ") + r.join("\n");
  }

  public writemathematica(): string {
    // write out a set of generators in mathematica syntax
    const os = this.getOrbitsDef(false);
    const r = [];
    const mvs = [];
    r.push(`(* ${this.header("").trim()} *)`);
    for (let i = 0; i < os.moveops.length; i++) {
      let movename = `m${externalName(this.notationMapper, os.movenames[i])}`;
      let doinv = false;
      if (movename[movename.length - 1] === "'") {
        movename = movename.substring(0, movename.length - 1);
        doinv = true;
      }
      mvs.push(movename);
      if (doinv) {
        r.push(`${movename}=${os.moveops[i].toPerm().inv().toMathematica()};`);
      } else {
        r.push(`${movename}=${os.moveops[i].toPerm().toMathematica()};`);
      }
    }
    r.push(`gen={${mvs.join(",")}};`);
    return r.join("\n");
  }

  public writeksolve(name: string = "PuzzleGeometryPuzzle"): string {
    const od = this.getOrbitsDef(false);
    return (
      this.header("# ") + od.toKsolve(name, this.notationMapper).join("\n")
    );
  }

  public getKPuzzleDefinition(
    fortwisty: boolean = true,
    includemoves: boolean = true,
  ): KPuzzleDefinition {
    const od = this.getOrbitsDef(fortwisty, includemoves);
    const internalDefinition = od.toKPuzzleDefinition(includemoves);
    (internalDefinition as any).experimentalPuzzleDescription =
      this.puzzleDescription;
    if (!internalDefinition) {
      throw new Error("Missing definition!");
    }
    return internalDefinition;
  }

  public getMoveFromBits(
    moverange: number[],
    amount: number,
    inverted: boolean,
    axiscmoves: number[][],
    setmoves: number[] | undefined,
    movesetorder: number,
  ): PGTransform {
    const moveorbits: PGOrbit[] = [];
    const perms = [];
    const oris = [];
    for (const len of this.cubieords) {
      perms.push(iota(len));
      oris.push(zeros(len));
    }
    for (let m = moverange[0]; m <= moverange[1]; m++) {
      const slicecmoves = axiscmoves[m];
      for (let j = 0; j < slicecmoves.length; j += 2 * movesetorder) {
        const mperm = slicecmoves.slice(j, j + 2 * movesetorder);
        const setnum = this.cubiesetnums[mperm[0]];
        for (let ii = 0; ii < mperm.length; ii += 2) {
          mperm[ii] = this.cubieordnums[mperm[ii]];
        }
        let inc = 2;
        let oinc = 3;
        if (inverted) {
          inc = mperm.length - 2;
          oinc = mperm.length - 1;
        }
        if (perms[setnum] === iota(this.cubieords[setnum])) {
          perms[setnum] = perms[setnum].slice();
          if (this.orbitoris[setnum] > 1 && !this.options.fixedOrientation) {
            oris[setnum] = oris[setnum].slice();
          }
        }
        for (let ii = 0; ii < mperm.length; ii += 2) {
          perms[setnum][mperm[(ii + inc) % mperm.length]] = mperm[ii];
          if (this.orbitoris[setnum] > 1 && !this.options.fixedOrientation) {
            oris[setnum][mperm[ii]] =
              (mperm[(ii + oinc) % mperm.length] -
                mperm[(ii + 1) % mperm.length] +
                2 * this.orbitoris[setnum]) %
              this.orbitoris[setnum];
          }
        }
      }
    }
    let lastId = new PGOrbit(iota(24), zeros(24), 1);
    for (let ii = 0; ii < this.cubiesetnames.length; ii++) {
      if (setmoves && !setmoves[ii]) {
        continue;
      }
      if (this.orbitoris[ii] === 1 || this.options.fixedOrientation) {
        if (perms[ii] === iota(lastId.perm.length)) {
          if (perms[ii] !== lastId.perm) {
            lastId = new PGOrbit(perms[ii], oris[ii], 1);
          }
          moveorbits.push(lastId);
        } else {
          moveorbits.push(new PGOrbit(perms[ii], oris[ii], 1));
        }
      } else {
        const no = new Array<number>(oris[ii].length);
        // convert ksolve oris to our internal ori rep
        for (let jj = 0; jj < perms[ii].length; jj++) {
          no[jj] = oris[ii][perms[ii][jj]];
        }
        moveorbits.push(new PGOrbit(perms[ii], no, this.orbitoris[ii]));
      }
    }
    let mv = new PGTransform(moveorbits);
    if (amount !== 1) {
      mv = mv.mulScalar(amount);
    }
    return mv;
  }

  private omitSet(name: string): boolean {
    for (const excludedSet of this.options.excludeOrbits) {
      if (excludedSet === name) {
        return true;
      }
    }
    return false;
  }

  private diffmvsets(a: any[], b: any[], slices: number, neg: boolean) {
    for (let i = 0; i < a.length; i += 2) {
      let found = false;
      for (let j = 0; !found && j < b.length; j += 2) {
        if (neg) {
          if (
            a[i][0] + b[j][1] === slices &&
            a[i][1] + b[j][0] === slices &&
            a[i + 1] === b[j + 1]
          ) {
            found = true;
          }
        } else {
          if (
            a[i][0] === b[j][0] &&
            a[i][1] === b[j][1] &&
            a[i + 1] === b[j + 1]
          ) {
            found = true;
          }
        }
      }
      if (!found) {
        return true;
      }
    }
    return false;
  }

  // TODO: This is only public for testing; can we make it private again?
  public getOrbitsDef(
    fortwisty: boolean,
    includemoves: boolean = true,
  ): PGOrbitsDef {
    // generate a representation of the puzzle
    const setmoves = [];
    if (fortwisty) {
      for (let i = 0; i < this.cubiesetnames.length; i++) {
        setmoves.push(1);
      }
    }
    const setnames: string[] = [];
    const setdefs: PGOrbitDef[] = [];
    // if both a movelist and rotations are needed, don't add rotations
    // that do not preserve the movelist.
    const mps = [];
    const addrot = [];
    for (let k = 0; k < this.moveplanesets.length; k++) {
      const moveset = this.getmovesets(k);
      mps.push(moveset);
      if (this.options.addRotations) {
        addrot.push(1);
      } else {
        addrot.push(0);
      }
    }
    const hasrotation = [];
    for (let k = 0; k < this.moveplanesets.length; k++) {
      const slices = this.moveplanesets[k].length;
      // if the move set includes a rotation around this axis, don't add any more
      let sawone = false;
      const moveset = mps[k];
      for (let i = 0; i < moveset.length; i += 2) {
        if (moveset[i][0] === 0 && moveset[i][1] === slices) {
          sawone = true;
        }
      }
      hasrotation[k] = sawone;
    }
    if (
      this.options.addRotations &&
      (this.options.moveList || this.options.fixedPieceType !== null)
    ) {
      for (let i = 0; i < this.moverotations.length; i++) {
        addrot[i] = 0;
      }
      for (let k = 0; k < this.moveplanesets.length; k++) {
        // if the move set includes a rotation around this axis, don't add any more
        if (hasrotation[k]) {
          addrot[k] = 3;
          continue;
        }
        // does a rotation around k preserve the move set?
        for (let i = 0; i < this.moverotations.length; i++) {
          let nn = this.moveplanenormals[k];
          for (let ii = 1; ii * 2 <= this.movesetorders[i]; ii++) {
            nn = nn.rotatepoint(this.moverotations[i][0]);
            if (addrot[i] & ii) {
              continue;
            }
            let found = -1;
            let neg = false;
            for (let j = 0; j < this.moveplanenormals.length; j++) {
              if (nn.dist(this.moveplanenormals[j]) < eps) {
                found = j;
                break;
              } else if (nn.dist(this.moveplanenormals[j].smul(-1)) < eps) {
                found = j;
                neg = true;
                break;
              }
            }
            if (found < 0) {
              throw new Error("Could not find rotation");
            }
            const cmp = mps[found];
            if (
              cmp.length !== mps[k].length ||
              this.moveplanesets[k].length !==
                this.moveplanesets[found].length ||
              this.diffmvsets(
                cmp,
                mps[k],
                this.moveplanesets[found].length,
                neg,
              )
            ) {
              addrot[i] |= ii;
            }
          }
        }
      }
      for (let i = 0; i < this.moverotations.length; i++) {
        if (addrot[i] === 0) {
          addrot[i] = 1;
        } else if (addrot[i] === 1) {
          if (this.movesetorders[i] > 3) {
            addrot[i] = 2;
          } else {
            addrot[i] = 0;
          }
        } else if (addrot[i] === 3) {
          addrot[i] = 0;
        } else {
          throw new Error("Impossible addrot val");
        }
      }
    }
    for (let k = 0; k < this.moveplanesets.length; k++) {
      if (addrot[k] !== 0 && !hasrotation[k]) {
        mps[k].push([0, this.moveplanesets[k].length]);
        mps[k].push(addrot[k]);
      }
    }
    for (let k = 0; k < this.moveplanesets.length; k++) {
      const moveset = mps[k];
      const movesetorder = this.movesetorders[k];
      // check there's no redundancy in moveset.
      for (let i = 0; i < moveset.length; i += 2) {
        for (let j = 0; j < i; j += 2) {
          if (
            moveset[i][0] === moveset[j][0] &&
            moveset[i][1] === moveset[j][1]
          ) {
            throw new Error("Redundant moves in moveset.");
          }
        }
      }
      const allbits = [];
      for (let i = 0; i < moveset.length; i += 2) {
        for (let j = moveset[i][0]; j <= moveset[i][1]; j++) {
          allbits[j] = 1;
        }
      }
      const axiscmoves = this.cmovesbyslice[k];
      for (let i = 0; i < axiscmoves.length; i++) {
        if (allbits[i] !== 1) {
          continue;
        }
        const slicecmoves = axiscmoves[i];
        for (let j = 0; j < slicecmoves.length; j += 2 * movesetorder) {
          if (this.skipcubie(slicecmoves[j])) {
            continue;
          }
          const ind = this.cubiesetnums[slicecmoves[j]];
          setmoves[ind] = 1;
        }
      }
    }
    for (let i = 0; i < this.cubiesetnames.length; i++) {
      if (!setmoves[i]) {
        continue;
      }
      if (this.omitSet(this.cubiesetnames[i])) {
        setmoves[i] = 0;
        continue;
      }
      setnames.push(this.cubiesetnames[i]);
      setdefs.push(
        new PGOrbitDef(
          this.cubieords[i],
          this.options.fixedOrientation ? 1 : this.orbitoris[i],
        ),
      );
    }
    const solved: PGOrbit[] = [];
    for (let i = 0; i < this.cubiesetnames.length; i++) {
      if (!setmoves[i]) {
        continue;
      }
      if (this.omitSet(this.cubiesetnames[i])) {
        continue;
      }
      const p = [];
      const o = [];
      for (let j = 0; j < this.cubieords[i]; j++) {
        if (fortwisty) {
          p.push(j);
        } else {
          const cubie = this.cubiesetcubies[i][j];
          p.push(this.cubievaluemap[cubie]);
        }
        o.push(0);
      }
      solved.push(
        new PGOrbit(
          p,
          o,
          this.options.fixedOrientation ? 1 : this.orbitoris[i],
        ),
      );
    }
    const movenames: string[] = [];
    const forcenames: boolean[] = [];
    const moves: PGTransform[] = [];
    const isrots: boolean[] = [];
    if (includemoves) {
      for (let k = 0; k < this.moveplanesets.length; k++) {
        const moveplaneset = this.moveplanesets[k];
        const slices = moveplaneset.length;
        const moveset = mps[k];
        const movesetgeo = this.movesetgeos[k];
        for (let i = 0; i < moveset.length; i += 2) {
          const movebits = moveset[i];
          // did these movebits come from a specified move?
          // if they did, we need to use that name.
          let nameoverride: string | undefined;
          let inverted = false;
          if (this.parsedmovelist !== undefined) {
            for (const parsedmove of this.parsedmovelist) {
              if (parsedmove[1] !== k) {
                continue;
              }
              let r = [];
              if (parsedmove[4]) {
                r = [parsedmove[2], parsedmove[3]];
              } else {
                r = [slices - parsedmove[3], slices - parsedmove[2]];
              }
              if (r[0] === movebits[0] && r[1] === movebits[1]) {
                nameoverride = parsedmove[0];
                inverted = !parsedmove[4];
              }
            }
          }
          if (nameoverride) {
            movenames.push(nameoverride);
            forcenames.push(true);
          } else {
            const mna = getmovename(movesetgeo, movebits, slices);
            inverted = mna[1];
            const movename = mna[0];
            if (moveset[i + 1] === 1) {
              movenames.push(movename);
            } else {
              movenames.push(movename + moveset[i + 1]);
            }
            forcenames.push(false);
          }
          isrots.push(movebits[0] === 0 && movebits[1] === slices);
          const mv = this.getMoveFromBits(
            movebits,
            moveset[i + 1],
            inverted,
            this.cmovesbyslice[k],
            setmoves,
            this.movesetorders[k],
          );
          moves.push(mv);
        }
      }
    }
    let r = new PGOrbitsDef(
      setnames,
      setdefs,
      new VisibleState(solved),
      movenames,
      moves,
      isrots,
      forcenames,
    );
    if (this.options.optimizeOrbits) {
      r = r.optimize();
    }
    if (this.options.scrambleAmount !== 0) {
      r.scramble(this.options.scrambleAmount);
    }
    return r;
  }

  public getScramble(n: number = 0): KTransformationData {
    const od = this.getOrbitsDef(false);
    return od.toKTransformationData(od.getScrambleTransformation(n));
  }

  public getMovesAsPerms(): Perm[] {
    return this.getOrbitsDef(false).moveops.map((_) => _.toPerm());
  }

  public showcanon(disp: (s: string) => void): void {
    // show information for canonical move derivation
    showcanon(this.getOrbitsDef(false), disp);
  }

  public getsolved(): Perm {
    // get a solved position
    const r = [];
    for (let i = 0; i < this.baseFaceCount; i++) {
      for (let j = 0; j < this.stickersperface; j++) {
        r.push(i);
      }
    }
    return new Perm(r);
  }

  // Given a rotation description that says to align feature1
  // with a given vector, and then as much as possible feature2
  // with another given vector, return a Quaternion that
  // performs this rotation.
  private getOrientationRotation(desiredRotation: any[]): Quat {
    const [feature1name, [x1, y1, z1]] = desiredRotation[0];
    const direction1 = new Quat(0, x1, -y1, z1);

    const [feature2name, [x2, y2, z2]] = desiredRotation[1];
    const direction2 = new Quat(0, x2, -y2, z2);
    let feature1: Quat | null = null;
    let feature2: Quat | null = null;
    const feature1geoname = this.swizzler.unswizzle(feature1name);
    const feature2geoname = this.swizzler.unswizzle(feature2name);
    for (const gn of this.geonormals) {
      if (feature1geoname === gn[1]) {
        feature1 = gn[0];
      }
      if (feature2geoname === gn[1]) {
        feature2 = gn[0];
      }
    }
    if (!feature1) {
      throw new Error(`Could not find feature ${feature1name}`);
    }
    if (!feature2) {
      throw new Error(`Could not find feature ${feature2name}`);
    }
    const r1 = feature1.pointrotation(direction1);
    const feature2rot = feature2.rotatepoint(r1);
    const r2 = feature2rot
      .unproject(direction1)
      .pointrotation(direction2.unproject(direction1));
    return r2.mul(r1);
  }

  private getInitial3DRotation(): Quat {
    const basefacecount = this.baseFaceCount;
    let orientationDescription: FaceBasedOrientationDescription | null = null;
    if (this.options.puzzleOrientation) {
      orientationDescription = this.options.puzzleOrientation;
    } else if (this.options.puzzleOrientations) {
      orientationDescription = this.options.puzzleOrientations[basefacecount];
    }
    // either no option specified or no matching key in
    // puzzleOrientations.
    if (!orientationDescription) {
      orientationDescription = defaultOrientations()[basefacecount];
    }
    if (!orientationDescription) {
      throw new Error("No default orientation?");
    }
    return this.getOrientationRotation(orientationDescription);
  }

  private generate2dmapping(
    w: number = 800,
    h: number = 500,
    trim: number = 10,
    threed: boolean = false,
    twodshrink: number = 0.92,
  ): (fn: number, q: Quat) => number[] {
    // generate a mapping to use for 2D for textures, svg
    w -= 2 * trim;
    h -= 2 * trim;
    function extendedges(a: number[][], n: number): void {
      let dx = a[1][0] - a[0][0];
      let dy = a[1][1] - a[0][1];
      const ang = (2 * Math.PI) / n;
      const cosa = Math.cos(ang);
      const sina = Math.sin(ang);
      for (let i = 2; i < n; i++) {
        const ndx = dx * cosa + dy * sina;
        dy = dy * cosa - dx * sina;
        dx = ndx;
        a.push([a[i - 1][0] + dx, a[i - 1][1] + dy]);
      }
    }
    // Find a net from a given face count.  Walk it, assuming we locate
    // the first edge from (0,0) to (1,1) and compute the minimum and
    // maximum vertex locations from this.  Then do a second walk, and
    // assign the actual geometry.
    this.genperms();
    const boundarygeo = this.getboundarygeometry();
    const face0 = boundarygeo.facenames[0][0];
    const polyn = face0.length; // number of vertices; 3, 4, or 5
    const net = this.net;
    if (net === null) {
      throw new Error("No net?");
    }
    const edges: any = {};
    let minx = 0;
    let miny = 0;
    let maxx = 1;
    let maxy = 0;
    edges[net[0][0]] = [
      [1, 0],
      [0, 0],
    ];
    extendedges(edges[net[0][0]], polyn);
    for (const neti of net) {
      const f0 = neti[0];
      if (!edges[f0]) {
        throw new Error("Bad edge description; first edge not connected.");
      }
      for (let j = 1; j < neti.length; j++) {
        const f1 = neti[j];
        if (f1 === "" || edges[f1]) {
          continue;
        }
        edges[f1] = [edges[f0][j % polyn], edges[f0][(j + polyn - 1) % polyn]];
        extendedges(edges[f1], polyn);
      }
    }
    for (const f in edges) {
      const es = edges[f];
      for (const esi of es) {
        minx = Math.min(minx, esi[0]);
        maxx = Math.max(maxx, esi[0]);
        miny = Math.min(miny, esi[1]);
        maxy = Math.max(maxy, esi[1]);
      }
    }
    const sc = Math.min(w / (maxx - minx), h / (maxy - miny));
    const xoff = 0.5 * (w - sc * (maxx + minx));
    const yoff = 0.5 * (h - sc * (maxy + miny));
    const geos: Record<string, Quat[]> = {};
    const bg = this.getboundarygeometry();
    const edges2: any = {};
    const initv = [
      [sc + xoff, yoff],
      [xoff, yoff],
    ];
    edges2[net[0][0]] = initv;
    extendedges(edges2[net[0][0]], polyn);
    geos[this.facenames[0][1]] = this.project2d(0, 0, [
      new Quat(0, initv[0][0], initv[0][1], 0),
      new Quat(0, initv[1][0], initv[1][1], 0),
    ]);
    const connectat = [];
    connectat[0] = 0;
    for (const neti of net) {
      const f0 = neti[0];
      if (!edges2[f0]) {
        throw new Error("Bad edge description; first edge not connected.");
      }
      let gfi = -1;
      for (let j = 0; j < bg.facenames.length; j++) {
        if (f0 === bg.facenames[j][1]) {
          gfi = j;
          break;
        }
      }
      if (gfi < 0) {
        throw new Error(`Could not find first face name ${f0}`);
      }
      const thisface = bg.facenames[gfi][0];
      for (let j = 1; j < neti.length; j++) {
        const f1 = neti[j];
        if (f1 === "" || edges2[f1]) {
          continue;
        }
        edges2[f1] = [
          edges2[f0][j % polyn],
          edges2[f0][(j + polyn - 1) % polyn],
        ];
        extendedges(edges2[f1], polyn);
        // what edge are we at?
        const caf0 = connectat[gfi];
        const mp = thisface[(caf0 + j) % polyn]
          .sum(thisface[(caf0 + j + polyn - 1) % polyn])
          .smul(0.5);
        const epi = findelement(bg.edgenames, mp);
        const edgename = bg.edgenames[epi][1];
        const el = splitByFaceNames(edgename, this.facenames);
        const gf1 = el[f0 === el[0] ? 1 : 0];
        let gf1i = -1;
        for (let k = 0; k < bg.facenames.length; k++) {
          if (gf1 === bg.facenames[k][1]) {
            gf1i = k;
            break;
          }
        }
        if (gf1i < 0) {
          throw new Error("Could not find second face name");
        }
        const otherface = bg.facenames[gf1i][0];
        for (let k = 0; k < otherface.length; k++) {
          const mp2 = otherface[k].sum(otherface[(k + 1) % polyn]).smul(0.5);
          if (mp2.dist(mp) <= eps) {
            const p1 = edges2[f0][(j + polyn - 1) % polyn];
            const p2 = edges2[f0][j % polyn];
            connectat[gf1i] = k;
            geos[gf1] = this.project2d(gf1i, k, [
              new Quat(0, p2[0], p2[1], 0),
              new Quat(0, p1[0], p1[1], 0),
            ]);
            break;
          }
        }
      }
    }
    let hix = 0;
    let hiy = 0;
    const rot = this.getInitial3DRotation();
    for (let face of this.faces) {
      if (threed) {
        face = face.rotate(rot);
      }
      for (let j = 0; j < face.length; j++) {
        hix = Math.max(hix, Math.abs(face.get(j).b));
        hiy = Math.max(hiy, Math.abs(face.get(j).c));
      }
    }
    const sc2 = Math.min(h / hiy / 2, (w - trim) / hix / 4);
    const mappt2d = (fn: number, q: Quat): number[] => {
      if (threed) {
        q = q.rotatepoint(rot);
        const xoff2 = 0.5 * trim + 0.25 * w;
        const xmul = this.baseplanes[fn].rotateplane(rot).d < 0 ? 1 : -1;
        return [
          trim + w * 0.5 + xmul * (xoff2 - q.b * sc2),
          trim + h * 0.5 + q.c * sc2,
        ];
      } else {
        const g = geos[this.facenames[fn][1]];
        return [
          trim + twodshrink * q.dot(g[0]) + g[2].b,
          trim + h - twodshrink * q.dot(g[1]) - g[2].c,
        ];
      }
    };
    return mappt2d;
  }

  public generatesvg(
    w: number = 800,
    h: number = 500,
    trim: number = 10,
    threed: boolean = false,
  ): string {
    const mappt2d = this.generate2dmapping(w, h, trim, threed);
    function drawedges(id: string, pts: number[][], color: string): string {
      return `<polygon id="${id}" class="sticker" style="fill: ${color}" points="${pts
        .map((p) => `${p[0]} ${p[1]}`)
        .join(" ")}"/>\n`;
    }
    // Let's build arrays for faster rendering.  We want to map from geo
    // base face number to color, and we want to map from geo face number
    // to 2D geometry.  These can be reused as long as the puzzle overall
    // orientation and canvas size remains unchanged.
    const pos = this.getsolved();
    const colormap = [];
    const facegeo = [];
    for (let i = 0; i < this.baseFaceCount; i++) {
      colormap[i] = this.colors[this.facenames[i][1]];
    }
    for (let i = 0; i < this.faces.length; i++) {
      const face = this.faces[i];
      const facenum = Math.floor(i / this.stickersperface);
      const fg = [];
      for (let j = 0; j < face.length; j++) {
        fg.push(mappt2d(facenum, face.get(j)));
      }
      facegeo.push(fg);
    }
    const svg = [];
    // group each base face so we can add a hover element
    for (let j = 0; j < this.baseFaceCount; j++) {
      svg.push("<g>");
      svg.push(`<title>${this.facenames[j][1]}</title>\n`);
      for (let ii = 0; ii < this.stickersperface; ii++) {
        const i = j * this.stickersperface + ii;
        const cubie = this.facetocubie[i];
        const cubieori = this.facetoord[i];
        const cubiesetnum = this.cubiesetnums[cubie];
        const cubieord = this.cubieordnums[cubie];
        const color = this.graybyori(cubie) ? "#808080" : colormap[pos.p[i]];
        let id = `${this.cubiesetnames[cubiesetnum]}-l${cubieord}-o${cubieori}`;
        svg.push(drawedges(id, facegeo[i], color));
        if (this.duplicatedFaces[i]) {
          for (let jj = 1; jj < this.duplicatedFaces[i]; jj++) {
            id = `${this.cubiesetnames[cubiesetnum]}-l${cubieord}-o${jj}`;
            svg.push(drawedges(id, facegeo[i], color));
          }
        }
      }
      svg.push("</g>");
    }
    const html = `<svg id="svg" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 800 500">\n<style type="text/css"><![CDATA[.sticker { stroke: #000000; stroke-width: 1px; }]]></style>\n${svg.join(
      "",
    )}</svg>`;
    return html;
  }

  // The colorfrac parameter says how much of the face should be
  // colored (vs dividing lines); we default to 0.77 which seems
  // to work pretty well.  It should be a number between probably
  // 0.4 and 0.9.
  public get3d(options?: {
    stickerColors?: string[];
    darkIgnoredOrbits?: boolean;
  }): StickerDat {
    const stickers = [];
    const rot = this.getInitial3DRotation();
    const faces = [];
    const maxdist: number = 0.52 * this.basefaces[0].get(0).len();
    for (let i = 0; i < this.basefaces.length; i++) {
      const coords = this.basefaces[i].rotate(rot);
      const name = this.facenames[i][1];
      faces.push({ coords: toFaceCoords(coords, maxdist), name });
    }
    for (let i = 0; i < this.faces.length; i++) {
      const facenum = Math.floor(i / this.stickersperface);
      const cubie = this.facetocubie[i];
      const cubieori = this.facetoord[i];
      const cubiesetnum = this.cubiesetnums[cubie];
      const cubieord = this.cubieordnums[cubie];
      let color = this.graybyori(cubie)
        ? options?.darkIgnoredOrbits
          ? "#222222"
          : "#808080"
        : this.colors[this.facenames[facenum][1]];
      if (options?.stickerColors) {
        color = options.stickerColors[i];
      }
      const coords = this.faces[i].rotate(rot);
      stickers.push({
        coords: toFaceCoords(coords, maxdist),
        color,
        orbit: this.cubiesetnames[cubiesetnum],
        ord: cubieord,
        ori: cubieori,
        face: facenum,
      });
      let fcoords = coords;
      if (this.duplicatedFaces[i]) {
        const rotdist = fcoords.length / this.duplicatedFaces[i];
        for (let jj = 1; jj < this.duplicatedFaces[i]; jj++) {
          for (let k = 0; k < rotdist; k++) {
            fcoords = fcoords.rotateforward();
          }
          stickers.push({
            coords: toFaceCoords(fcoords, maxdist),
            color,
            orbit: this.cubiesetnames[cubiesetnum],
            ord: cubieord,
            ori: jj,
            face: facenum,
            isDup: true,
          });
        }
      }
    }
    const grips: StickerDatAxis[] = [];
    for (let i = 0; i < this.movesetgeos.length; i++) {
      const msg = this.movesetgeos[i];
      const order = this.movesetorders[i];
      for (const gn of this.geonormals) {
        if (msg[0] === gn[1] && msg[1] === gn[2]) {
          grips.push({
            coordinates: toCoords(gn[0].rotatepoint(rot), 1),
            quantumMove: new Move(msg[0]),
            order,
          });
          grips.push({
            coordinates: toCoords(gn[0].rotatepoint(rot).smul(-1), 1),
            quantumMove: new Move(msg[2]),
            order,
          });
        }
      }
    }
    const twodmapper = this.generate2dmapping(2880, 2160, 0, false, 1.0);
    const g = (() => {
      const irot = rot.invrot();
      return (facenum: number, coords: number[]): number[] => {
        let q = new Quat(
          0,
          coords[0] * maxdist,
          -coords[1] * maxdist,
          coords[2] * maxdist,
        );
        q = q.rotatepoint(irot);
        const x = twodmapper(facenum, q);
        x[0] /= 2880;
        x[1] = 1 - x[1] / 2160;
        return x;
      };
    })().bind(this);
    return {
      stickers,
      faces,
      axis: grips,
      unswizzle: this.unswizzle.bind(this),
      notationMapper: this.notationMapper,
      textureMapper: { getuv: g },
    };
  }

  //  From the name of a geometric element (face, vertex, edge), get a
  //  normal vector respecting the default orientation.  This is useful
  //  to define the initial position of the camera in a 3D scene.  The
  //  return value is normalized, so multiply it by the camera distance.
  //  Returns undefined if no such geometric element.
  public getGeoNormal(geoname: string): number[] | undefined {
    const rot = this.getInitial3DRotation();
    const grip = this.swizzler.unswizzle(geoname);
    for (const gn of this.geonormals) {
      if (grip === gn[1]) {
        const r = toCoords(gn[0].rotatepoint(rot), 1);
        //  This routine is intended to use for the camera location.
        //  If the camera location is vertical, and we give some
        //  near-zero values for x and z, then the rotation in the
        //  X/Z plane will be somewhat arbitrary.  So we clean up the
        //  returned vector here.  We give a very slight positive
        //  z value.
        if (Math.abs(r[0]) < eps && Math.abs(r[2]) < eps) {
          r[0] = 0.0;
          r[2] = 1e-6;
        }
        return r;
      }
    }
    return undefined;
  }

  private getfaceindex(facenum: number): number {
    const divid = this.stickersperface;
    return Math.floor(facenum / divid);
  }

  public textForTwizzleExplorer(): string {
    return `Faces ${this.baseplanerot.length}
Stickers per face ${this.stickersperface}
Short edge ${this.shortedge}
Cubies ${this.cubies.length}
Edge distance ${this.edgedistance}
Vertex distance ${this.vertexdistance}`;
  }

  writeSchreierSims(tw: (s: string) => void) {
    const os = this.getOrbitsDef(false);
    const as = os.reassemblySize();
    tw(`Reassembly size is ${as}`);
    const ss = schreierSims(this.getMovesAsPerms(), tw);
    const r = as / ss;
    tw(`Ratio is ${r}`);
  }
}

export class PGNotation {
  private orbitNames: string[];
  constructor(
    private pg: PuzzleGeometry,
    od: PGOrbitsDef,
  ) {
    this.orbitNames = od.orbitnames;
  }

  public lookupMove(move: Move): KTransformationData | null {
    const mv = this.pg.parseMove(move);
    // if a move list subset is defined, don't return moves outside the subset.
    if (this.pg.parsedmovelist) {
      let found = false;
      for (const parsedmove of this.pg.parsedmovelist) {
        if (
          parsedmove[1] === mv[1] &&
          parsedmove[2] === mv[2] &&
          parsedmove[3] === mv[3] &&
          parsedmove[4] === mv[4]
        ) {
          found = true;
        }
      }
      if (!found) {
        return null;
      }
    }
    let bits = [mv[2], mv[3]];
    if (!mv[4]) {
      const slices = this.pg.moveplanesets[mv[1]].length;
      bits = [slices - mv[3], slices - mv[2]];
    }
    const pgmv = this.pg.getMoveFromBits(
      bits,
      mv[5],
      !mv[4],
      this.pg.cmovesbyslice[mv[1]],
      undefined,
      this.pg.movesetorders[mv[1]],
    );
    const r = PGOrbitsDef.transformToKTransformationData(this.orbitNames, pgmv);
    return r;
  }

  remapKPuzzleDefinition(
    kpuzzleDefinition: KPuzzleDefinition,
  ): KPuzzleDefinition {
    return remapKPuzzleDefinition(kpuzzleDefinition, this.pg.notationMapper);
  }
}
