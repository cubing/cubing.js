/* tslint:disable no-bitwise */
/* tslint:disable prefer-for-of */ // TODO
/* tslint:disable only-arrow-functions */ // TODO
/* tslint:disable typedef */ // TODO

import { Perm } from "./Perm";
import { Orbit, OrbitDef, OrbitsDef, showcanon, Transformation, VisibleState } from "./PermOriSet";
import { closure, cube, dodecahedron, getface, icosahedron, octahedron, tetrahedron, uniqueplanes } from "./PlatonicGenerator";
import { PuzzleDescriptionString, Puzzles } from "./Puzzles";
import { centermassface, expandfaces, Quat } from "./Quat";

export interface StickerDatSticker {
  coords: number[][];
  color: string;
  orbit: string;
  ord: number;
  ori: number;
}

export interface StickerDatFace {
  coords: number[][];
  name: string;
}

export type StickerDatAxis = [number[], string, number];

export interface StickerDat {
  stickers: StickerDatSticker[];
  faces: StickerDatFace[];
  axis: StickerDatAxis[];
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
const defaultnets: any = {
  4: // four faces: tetrahedron
    [
      ["F", "D", "L", "R"],
    ],
  6: // six faces: cube
    [
      ["F", "D", "L", "U", "R"],
      ["R", "F", "", "B", ""],
    ],
  8: // eight faces: octahedron
    [
      ["F", "D", "L", "R"],
      ["D", "F", "BR", ""],
      ["BR", "D", "", "BB"],
      ["BB", "BR", "U", "BL"],
    ],
  12: // twelve faces:  dodecahedron; U/F/R/F/BL/BR from megaminx
    [
      ["U", "F", "", "", "", ""],
      ["F", "U", "R", "C", "A", "L"],
      ["R", "F", "", "", "E", ""],
      ["E", "R", "", "BF", "", ""],
      ["BF", "E", "BR", "BL", "I", "D"],
    ],
  20: // twenty faces: icosahedron
    [
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

const defaultcolors: any = {
  // the colors should use the same naming convention as the nets, above.
  4: { F: "#00ff00", D: "#ffff00", L: "#ff0000", R: "#0000ff" },
  6: {
    U: "#ffffff", F: "#00ff00", R: "#ff0000",
    D: "#ffff00", B: "#0000ff", L: "#ff8000",
  },
  8: {
    U: "#e085b9", F: "#080d99", R: "#c1e35c", D: "#22955e",
    BB: "#9121ab", L: "#b27814", BL: "#0d35ad", BR: "#eb126b",
  },
  12: {
    U: "#ffffff", F: "#006633", R: "#ff0000", C: "#ffffd0",
    A: "#3399ff", L: "#660099", E: "#ff66cc", BF: "#99ff00",
    BR: "#0000ff", BL: "#ffff00", I: "#ff6633", D: "#999999",
  },
  20: {
    R: "#db69f0", C: "#178fde", F: "#23238b", E: "#9cc726",
    L: "#2c212d", U: "#177fa7", A: "#e0de7f", G: "#2b57c0",
    I: "#41126b", S: "#4b8c28", H: "#7c098d", J: "#7fe7b4",
    B: "#85fb74", K: "#3f4bc3", D: "#0ff555", M: "#f1c2c8",
    O: "#58d340", P: "#c514f2", N: "#14494e", Q: "#8b1be1",
  },
};

// the default precedence of the faces is given here.  This permits
// the orientations to be reasonably predictable.  There are tradeoffs;
// some face precedence orders do better things to the edge orientations
// than the corner orientations and some are the opposite.
const defaultfaceorders: any = {
  4: ["F", "D", "L", "R"],
  6: ["U", "D", "F", "B", "L", "R"],
  8: ["F", "BB", "D", "U", "BR", "L", "R", "BL"],
  12: ["L", "E", "F", "BF", "R", "I",
    "U", "D", "BR", "A", "BL", "C"],
  20: ["L", "S", "E", "O", "F", "B", "I", "P", "R", "K",
    "U", "D", "J", "A", "Q", "H", "G", "N", "M", "C"],
};

function findelement(a: any[], p: Quat): number {
  // find something in facenames, vertexnames, edgenames
  for (let i = 0; i < a.length; i++) {
    if (a[i][0].dist(p) < eps) {
      return i;
    }
  }
  throw new Error("Element not found");
}

export function getpuzzles(): { [s: string]: PuzzleDescriptionString } {
  // get some simple definitions of basic puzzles
  return Puzzles;
}

export function getpuzzle(puzzleName: PuzzleName): PuzzleDescriptionString {
  // get some simple definitions of basic puzzles
  return Puzzles[puzzleName];
}

export function parsedesc(s: string): any { // parse a text description
  const a = s.split(/ /).filter(Boolean);
  if (a.length % 2 === 0) {
    return false;
  }
  if (a[0] !== "o" && a[0] !== "c" && a[0] !== "i" && a[0] !== "d" && a[0] !== "t") {
    return false;
  }
  const r = [];
  for (let i = 1; i < a.length; i += 2) {
    if (a[i] !== "f" && a[i] !== "v" && a[i] !== "e") {
      return false;
    }
    r.push([a[i], a[i + 1]]);
  }
  return [a[0], r];
}

// TODO: Automatically associate this with the source list.
type PuzzleName = "2x2x2" | "3x3x3" | "4x4x4" | "5x5x5" | "6x6x6" | "7x7x7" | "8x8x8" | "9x9x9" | "10x10x10" | "11x11x11" | "12x12x12" | "13x13x13" | "20x20x20" | "skewb" | "master skewb" | "professor skewb" | "compy cube" | "helicopter" | "dino" | "little chop" | "pyramorphix" | "mastermorphix" | "pyraminx" | "master pyraminx" | "professor pyraminx" | "Jing pyraminx" | "master pyramorphix" | "megaminx" | "gigaminx" | "pentultimate" | "starminx" | "starminx 2" | "pyraminx crystal" | "chopasaurus" | "big chop" | "skewb diamond" | "FTO" | "Christopher's jewel" | "octastar" | "Trajber's octahedron" | "radio chop" | "icosamate" | "icosahedron 2" | "icosahedron 3" | "icosahedron static faces" | "icosahedron moving faces" | "Eita";

export function getPuzzleGeometryByDesc(desc: string, options: string[] = []): PuzzleGeometry {
  const [shape, cuts] = parsedesc(desc);
  const pg = new PuzzleGeometry(shape, cuts, ["allmoves", "true"].concat(options));
  pg.allstickers();
  pg.genperms();
  return pg;
}

export function getPuzzleGeometryByName(puzzleName: PuzzleName, options: string[] = []): PuzzleGeometry {
  return getPuzzleGeometryByDesc(Puzzles[puzzleName], options);
}

function getmovename(geo: any, bits: number, slices: number): any {
  // generate a move name based on bits, slice, and geo
  // if the move name is from the opposite face, say so.
  // find the face that's turned.
  let nbits = 0;
  let inverted = false;
  for (let i = 0; i <= slices; i++) {
    if ((bits >> i) & 1) {
      nbits |= 1 << (slices - i);
    }
  }
  if (nbits < bits) { // flip if most of the move is on the other side
    geo = [geo[2], geo[3], geo[0], geo[1]];
    bits = nbits;
    inverted = true;
  }
  let movenameFamily = geo[0];
  let movenamePrefix = "";
  let hibit = 0;
  while (bits >> (1 + hibit)) {
    hibit++;
  }
  if (bits === (2 << slices) - 1) {
    movenameFamily = movenameFamily + "v";
  } else if (bits === (1 << hibit)) {
    if (hibit > 0) {
      movenamePrefix = String(hibit + 1);
    }
  } else if (bits === ((2 << hibit) - 1)) {
    movenameFamily = movenameFamily.toLowerCase();
    if (hibit > 1) {
      movenamePrefix = String(hibit + 1);
    }
  } else {
    movenamePrefix = "_" + bits + "_";
    //       throw "We only support slice and outer block moves right now. " + bits ;
  }
  return [movenamePrefix + movenameFamily, inverted];
}

// split a geometrical element into face names.  The facenames must
// be prefix-free.
function splitByFaceNames(s: string, facenames: any[]): string[] {
  const r: string[] = [];
  let at = 0;
  while (at < s.length) {
    let found = false;
    for (let i = 0; i < facenames.length; i++) {
      if (s.substr(at).startsWith(facenames[i][1])) {
        r.push(facenames[i][1]);
        at += facenames[i][1].length;
        found = true;
        break;
      }
    }
    if (!found) {
      throw new Error(("Could not split " + s + " into face names."));
    }
  }
  return r;
}

function toCoords(q: Quat, maxdist: number): number[] {
  return [- q.b / maxdist, - q.c / maxdist, - q.d / maxdist];
}

function toFaceCoords(q: Quat[], maxdist: number): number[][] {
  const r = [];
  const n = q.length;
  for (let i = 0; i < n; i++) {
    r[n - i - 1] = toCoords(q[i], maxdist);
  }
  return r;
}

function trimEdges(face: Quat[], tr: number): Quat[] {
  const r: Quat[] = [];
  for (let iter = 1; iter < 10; iter++) {
    for (let i = 0; i < face.length; i++) {
      const pi = (i + face.length - 1) % face.length;
      const ni = (i + 1) % face.length;
      const A = face[pi].sub(face[i]).normalize();
      const B = face[ni].sub(face[i]).normalize();
      const d = A.dot(B);
      const m = tr / Math.sqrt(1 - d * d);
      r[i] = face[i].sum(A.sum(B).smul(m));
    }
    let good = true;
    for (let i = 0; good && i < r.length; i++) {
      const pi = (i + face.length - 1) % face.length;
      const ni = (i + 1) % face.length;
      if (r[pi].sub(r[i]).cross(r[ni].sub(r[i])).dot(r[i]) >= 0) {
        good = false;
      }
    }
    if (good) {
      return r;
    }
    tr /= 2;
  }
  return face;
}

export class PuzzleGeometry {
  public args: string = "";
  public rotations: Quat[];    // all members of the rotation group
  public baseplanerot: Quat[]; // unique rotations of the baseplane
  public baseplanes: Quat[];   // planes, corresponding to faces
  public facenames: any[];     // face names
  public faceplanes: any;      // face planes
  public edgenames: any[];     // edge names
  public vertexnames: any[];   // vertexnames
  public geonormals: any[];    // all geometric directions, with names and types
  public moveplanes: Quat[];   // the planes that split moves
  public moveplanesets: any[]; // the move planes, in parallel sets
  public movesetorders: any[]; // the order of rotations for each move set
  public movesetgeos: any[];   // geometric feature information for move sets
  public basefaces: Quat[][];  // polytope faces before cuts
  public faces: Quat[][];      // all the stickers
  public basefacecount: number;      // number of base faces
  public stickersperface: number;    // number of stickers per face
  public cornerfaces: number;        // number of faces that meet at a corner
  public cubies: any[];        // the cubies
  public shortedge: number;         // shortest edge
  public vertexdistance: number;    // vertex distance
  public edgedistance: number;      // edge distance
  public orbits: number;            // count of cubie orbits
  public facetocubies: any[];  // map a face to a cubie index and offset
  public moverotations: Quat[][]; // move rotations
  public cubiekey: any;             // cubie locator
  public cubiekeys: string[];  // cubie keys
  public facelisthash: any;         // face list by key
  public cubiesetnames: any[]; // cubie set names
  public cubieords: number[];  // the size of each orbit
  public cubiesetnums: number[];
  public cubieordnums: number[];
  public orbitoris: number[];  // the orientation size of each orbit
  public cubievaluemap: number[]; // the map for identical cubies
  public cubiesetcubies: number[][]; // cubies in each cubie set
  public movesbyslice: any[];  // move as perms by slice
  public cmovesbyslice: any[] = []; // cmoves as perms by slice
  // options
  public verbose: number = 0;         // verbosity (console.log)
  public allmoves: boolean = false; // generate all slice moves in ksolve
  public outerblockmoves: boolean;  // generate outer block moves
  public vertexmoves: boolean;      // generate vertex moves
  public addrotations: boolean;     // add symmetry information to ksolve output
  public movelist: any;             // move list to generate
  public parsedmovelist: any;       // parsed move list
  public cornersets: boolean = true; // include corner sets
  public centersets: boolean = true; // include center sets
  public edgesets: boolean = true;   // include edge sets
  public graycorners: boolean = false; // make corner sets gray
  public graycenters: boolean = false; // make center sets gray
  public grayedges: boolean = false;   // make edge sets gray
  public killorientation: boolean = false; // eliminate any orientations
  public optimize: boolean = false;  // optimize PermOri
  public scramble: number = 0;       // scramble?
  public ksolvemovenames: string[]; // move names from ksolve
  public fixPiece: string = "";      // fix a piece?
  public orientCenters: boolean = false; // orient centers?
  public duplicatedFaces: number[] = []; // which faces are duplicated
  public duplicatedCubies: number[] = []; // which cubies are duplicated
  public fixedCubie: number = -1;    // fixed cubie, if any
  public svggrips: any[];       // grips from svg generation by svg coordinate
  public net: any = [];
  public colors: any = [];
  public faceorder: any = [];
  public faceprecedence: number[] = [];
  constructor(shape: string, cuts: string[][], optionlist: any[] | undefined) {
    if (optionlist !== undefined) {
      if (optionlist.length % 2 !== 0) {
        throw new Error("Odd length in option list?");
      }
      for (let i = 0; i < optionlist.length; i += 2) {
        if (optionlist[i] === "verbose") {
          this.verbose++;
        } else if (optionlist[i] === "quiet") {
          this.verbose = 0;
        } else if (optionlist[i] === "allmoves") {
          this.allmoves = optionlist[i + 1];
        } else if (optionlist[i] === "outerblockmoves") {
          this.outerblockmoves = optionlist[i + 1];
        } else if (optionlist[i] === "vertexmoves") {
          this.vertexmoves = optionlist[i + 1];
        } else if (optionlist[i] === "rotations") {
          this.addrotations = optionlist[i + 1];
        } else if (optionlist[i] === "cornersets") {
          this.cornersets = optionlist[i + 1];
        } else if (optionlist[i] === "centersets") {
          this.centersets = optionlist[i + 1];
        } else if (optionlist[i] === "edgesets") {
          this.edgesets = optionlist[i + 1];
        } else if (optionlist[i] === "graycorners") {
          this.graycorners = optionlist[i + 1];
        } else if (optionlist[i] === "graycenters") {
          this.graycenters = optionlist[i + 1];
        } else if (optionlist[i] === "grayedges") {
          this.grayedges = optionlist[i + 1];
        } else if (optionlist[i] === "movelist") {
          this.movelist = optionlist[i + 1];
        } else if (optionlist[i] === "killorientation") {
          this.killorientation = optionlist[i + 1];
        } else if (optionlist[i] === "optimize") {
          this.optimize = optionlist[i + 1];
        } else if (optionlist[i] === "scramble") {
          this.scramble = optionlist[i + 1];
        } else if (optionlist[i] === "fix") {
          this.fixPiece = optionlist[i + 1];
        } else if (optionlist[i] === "orientcenters") {
          this.orientCenters = optionlist[i + 1];
        } else {
          throw new Error("Bad option while processing option list " + optionlist[i]);
        }
      }
    }
    this.args = shape + " " + (cuts.map((_) => _.join(" ")).join(" "));
    if (optionlist) {
      this.args += " " + optionlist.join(" ");
    }
    if (this.verbose > 0) {
      console.log(this.header("# "));
    }
    this.create(shape, cuts);
  }

  public create(shape: string, cuts: any[]): void {
    // create the shape, doing all the essential geometry
    // create only goes far enough to figure out how many stickers per
    // face, and what the short edge is.  If the short edge is too short,
    // we probably don't want to display or manipulate this one.  How
    // short is too short is hard to say.
    // var that = this ; // TODO
    this.moveplanes = [];
    this.faces = [];
    this.cubies = [];
    let g = null;
    switch (shape) {
      case "c": g = cube(); break;
      case "o": g = octahedron(); break;
      case "i": g = icosahedron(); break;
      case "t": g = tetrahedron(); break;
      case "d": g = dodecahedron(); break;
      default: throw new Error("Bad shape argument: " + shape);
    }
    this.rotations = closure(g);
    if (this.verbose) { console.log("# Rotations: " + this.rotations.length); }
    const baseplane = g[0];
    this.baseplanerot = uniqueplanes(baseplane, this.rotations);
    const baseplanes = this.baseplanerot.map((_) => baseplane.rotateplane(_));
    this.baseplanes = baseplanes;
    this.basefacecount = baseplanes.length;
    const net = defaultnets[baseplanes.length];
    this.net = net;
    this.colors = defaultcolors[baseplanes.length];
    this.faceorder = defaultfaceorders[baseplanes.length];
    if (this.verbose) { console.log("# Base planes: " + baseplanes.length); }
    const baseface = getface(baseplanes);
    if (this.verbose) { console.log("# Face vertices: " + baseface.length); }
    const facenormal = baseplanes[0].makenormal();
    const edgenormal = baseface[0].sum(baseface[1]).makenormal();
    const vertexnormal = baseface[0].makenormal();
    const cutplanes = [];
    for (let i = 0; i < cuts.length; i++) {
      let normal = null;
      switch (cuts[i][0]) {
        case "f": normal = facenormal; break;
        case "v": normal = vertexnormal; break;
        case "e": normal = edgenormal; break;
        default: throw new Error("Bad cut argument: " + cuts[i][0]);
      }
      cutplanes.push(normal.makecut(cuts[i][1]));
    }
    const boundary = new Quat(1, facenormal.b, facenormal.c, facenormal.d);
    if (this.verbose) { console.log("# Boundary is " + boundary); }
    const planerot = uniqueplanes(boundary, this.rotations);
    const planes = planerot.map((_) => boundary.rotateplane(_));
    let faces = [getface(planes)];
    this.basefaces = [];
    for (let i = 0; i < this.baseplanerot.length; i++) {
      const face = this.baseplanerot[i].rotateface(faces[0]);
      this.basefaces.push(face);
    }
    //
    //   Determine names for edges, vertices, and planes.  Planes are defined
    //   by the plane normal/distance; edges are defined by the midpoint;
    //   vertices are defined by actual point.  In each case we define a name.
    //   Note that edges have two potential names, and corners have n where
    //   n planes meet at a vertex.  We arbitrarily choose the one that is
    //   alphabetically first (and we will probably want to change this).
    //
    const facenames: any[] = [];
    const faceplanes = [];
    const vertexnames: any[] = [];
    const edgenames: any[] = [];
    const edgesperface = faces[0].length;
    function searchaddelement(a: any[], p: Quat, name: any) {
      for (let i = 0; i < a.length; i++) {
        if (a[i][0].dist(p) < eps) {
          a[i].push(name);
          return;
        }
      }
      a.push([p, name]);
    }
    for (let i = 0; i < this.baseplanerot.length; i++) {
      const face = this.baseplanerot[i].rotateface(faces[0]);
      for (let j = 0; j < face.length; j++) {
        const jj = (j + 1) % face.length;
        const midpoint = face[j].sum(face[jj]).smul(0.5);
        searchaddelement(edgenames, midpoint, i);
      }
    }
    const otherfaces = [];
    for (let i = 0; i < this.baseplanerot.length; i++) {
      const face = this.baseplanerot[i].rotateface(faces[0]);
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
    const faceindextoname: any = [];
    faceindextoname.push(net[0][0]);
    facenametoindex[net[0][0]] = 0;
    faceindextoname[otherfaces[0][0]] = net[0][1];
    facenametoindex[net[0][1]] = otherfaces[0][0];
    for (let i = 0; i < net.length; i++) {
      const f0 = net[i][0];
      const fi = facenametoindex[f0];
      if (fi === undefined) {
        throw new Error("Bad edge description; first edge not connected");
      }
      let ii = -1;
      for (let j = 0; j < otherfaces[fi].length; j++) {
        const fn2 = faceindextoname[otherfaces[fi][j]];
        if (fn2 !== undefined && fn2 === net[i][1]) {
          ii = j;
          break;
        }
      }
      if (ii < 0) {
        throw new Error("First element of a net not known");
      }
      for (let j = 2; j < net[i].length; j++) {
        if (net[i][j] === "") {
          continue;
        }
        const of = otherfaces[fi][(j + ii - 1) % edgesperface];
        const fn2 = faceindextoname[of];
        if (fn2 !== undefined && fn2 !== net[i][j]) {
          throw new Error("Face mismatch in net");
        }
        faceindextoname[of] = net[i][j];
        facenametoindex[net[i][j]] = of;
      }
    }
    for (let i = 0; i < faceindextoname.length; i++) {
      let found = false;
      for (let j = 0; j < this.faceorder.length; j++) {
        if (faceindextoname[i] === this.faceorder[j]) {
          this.faceprecedence[i] = j;
          found = true;
          break;
        }
      }
      if (!found) {
        throw new Error("Could not find face " + faceindextoname[i] +
          " in face order list " + this.faceorder);
      }
    }
    for (let i = 0; i < this.baseplanerot.length; i++) {
      const face = this.baseplanerot[i].rotateface(faces[0]);
      const faceplane = boundary.rotateplane(this.baseplanerot[i]);
      const facename = faceindextoname[i];
      facenames.push([face, facename]);
      faceplanes.push([faceplane, facename]);
    }
    for (let i = 0; i < this.baseplanerot.length; i++) {
      const face = this.baseplanerot[i].rotateface(faces[0]);
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
    // fix the edge names; use face precedence order
    for (let i = 0; i < edgenames.length; i++) {
      if (edgenames[i].length !== 3) {
        throw new Error("Bad length in edge names " + edgenames[i]);
      }
      let c1 = faceindextoname[edgenames[i][1]];
      const c2 = faceindextoname[edgenames[i][2]];
      if (this.faceprecedence[edgenames[i][1]] <
        this.faceprecedence[edgenames[i][2]]) {
        c1 = c1 + c2;
      } else {
        c1 = c2 + c1;
      }
      edgenames[i] = [edgenames[i][0], c1];
    }
    // fix the vertex names; clockwise rotations; low face first.
    this.cornerfaces = vertexnames[0].length - 1;
    for (let i = 0; i < vertexnames.length; i++) {
      if (vertexnames[i].length < 4) {
        throw new Error("Bad length in vertex names");
      }
      let st = 1;
      for (let j = 2; j < vertexnames[i].length; j++) {
        if (this.faceprecedence[facenametoindex[vertexnames[i][j][0]]] <
          this.faceprecedence[facenametoindex[vertexnames[i][st][0]]]) {
          st = j;
        }
      }
      let r = "";
      for (let j = 1; j < vertexnames[i].length; j++) {
        r = r + vertexnames[i][st][0];
        for (let k = 1; k < vertexnames[i].length; k++) {
          if (vertexnames[i][st][2] === vertexnames[i][k][1]) {
            st = k;
            break;
          }
        }
      }
      vertexnames[i] = [vertexnames[i][0], r];
    }
    if (this.verbose > 1) {
      console.log("Face precedence list: " + this.faceorder.join(" "));
      console.log("Face names: " + facenames.map((_: any) => _[1]).join(" "));
      console.log("Edge names: " + edgenames.map((_: any) => _[1]).join(" "));
      console.log("Vertex names: " + vertexnames.map((_: any) => _[1]).join(" "));
    }
    const geonormals = [];
    for (let i = 0; i < faceplanes.length; i++) {
      geonormals.push(
        [faceplanes[i][0].makenormal(), faceplanes[i][1], "f"]);
    }
    for (let i = 0; i < edgenames.length; i++) {
      geonormals.push([edgenames[i][0].makenormal(), edgenames[i][1], "e"]);
    }
    for (let i = 0; i < vertexnames.length; i++) {
      geonormals.push(
        [vertexnames[i][0].makenormal(), vertexnames[i][1], "v"]);
    }
    this.facenames = facenames;
    this.faceplanes = faceplanes;
    this.edgenames = edgenames;
    this.vertexnames = vertexnames;
    this.geonormals = geonormals;
    const zero = new Quat(0, 0, 0, 0);
    this.edgedistance = faces[0][0].sum(faces[0][1]).smul(0.5).dist(zero);
    this.vertexdistance = faces[0][0].dist(zero);
    if (this.verbose) {
      console.log("# Distances: face " + 1 + " edge " + this.edgedistance +
        " vertex " + this.vertexdistance);
    }
    // expand cutplanes by rotations.  We only work with one face here.
    for (let c = 0; c < cutplanes.length; c++) {
      for (let i = 0; i < this.rotations.length; i++) {
        const q = cutplanes[c].rotateplane(this.rotations[i]);
        let wasseen = false;
        for (let j = 0; j < this.moveplanes.length; j++) {
          if (q.sameplane(this.moveplanes[j])) {
            wasseen = true;
            break;
          }
        }
        if (!wasseen) {
          this.moveplanes.push(q);
          faces = q.cutfaces(faces);
        }
      }
    }
    this.faces = faces;
    if (this.verbose) { console.log("# Faces is now " + faces.length); }
    this.stickersperface = faces.length;
    //  Find and report the shortest edge in any of the faces.  If this
    //  is small the puzzle is probably not practical or displayable.
    let shortedge = 1e99;
    for (let i = 0; i < faces.length; i++) {
      for (let j = 0; j < faces[i].length; j++) {
        const k = (j + 1) % faces[i].length;
        const t = faces[i][j].dist(faces[i][k]);
        if (t < shortedge) {
          shortedge = t;
        }
      }
    }
    this.shortedge = shortedge;
    if (this.verbose) { console.log("# Short edge is " + shortedge); }
  }

  public keyface(face: Quat[]): string {
    // take a face and figure out the sides of each move plane
    let s = "";
    for (let i = 0; i < this.moveplanesets.length; i++) {
      let t = 0;
      for (let j = 0; j < this.moveplanesets[i].length; j++) {
        if (this.moveplanesets[i][j].faceside(face) > 0) {
          t++;
        }
      }
      s = s + " " + t;
    }
    return s;
  }

  public findcubie(face: Quat[]): number {
    return this.facetocubies[this.findface(face)][0];
  }

  public findface(face: Quat[]): number {
    const cm = centermassface(face);
    const key = this.keyface(face);
    for (let i = 0; i < this.facelisthash[key].length; i++) {
      const face2 = this.facelisthash[key][i];
      if (Math.abs(cm.dist(
        centermassface(this.faces[face2]))) < eps) {
        return face2;
      }
    }
    throw new Error("Could not find face.");
  }

  public project2d(facen: number, edgen: number, targvec: Quat[]): any {
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
    const off = new Quat(0, targvec[0].b - x1.dot(face[edgen]),
      targvec[0].c - y1.dot(face[edgen]), 0);
    return [x1, y1, off];
  }

public allstickers(): void {
    // next step is to calculate all the stickers and orbits
    // We do enough work here to display the cube on the screen.
    // take our newly split base face and expand it by the rotation matrix.
    // this generates our full set of "stickers".
    this.faces = expandfaces(this.baseplanerot, this.faces);
    if (this.verbose) { console.log("# Total stickers is now " + this.faces.length); }
    // Split moveplanes into a list of parallel planes.
    const moveplanesets = [];
    for (let i = 0; i < this.moveplanes.length; i++) {
      let wasseen = false;
      const q = this.moveplanes[i];
      const qnormal = q.makenormal();
      for (let j = 0; j < moveplanesets.length; j++) {
        if (qnormal.sameplane(moveplanesets[j][0].makenormal())) {
          moveplanesets[j].push(q);
          wasseen = true;
          break;
        }
      }
      if (!wasseen) {
        moveplanesets.push([q]);
      }
    }
    // make the normals all face the same way in each set.
    for (let i = 0; i < moveplanesets.length; i++) {
      const q: Quat[] = moveplanesets[i].map((_) => _.normalizeplane());
      const goodnormal = q[0].makenormal();
      for (let j = 0; j < q.length; j++) {
        if (q[j].makenormal().dist(goodnormal) > eps) {
          q[j] = q[j].smul(-1);
        }
      }
      q.sort((a, b) => a.a - b.a);
      moveplanesets[i] = q;
    }
    this.moveplanesets = moveplanesets;
    const sizes = moveplanesets.map((_) => _.length);
    if (this.verbose) { console.log("# Move plane sets: " + sizes); }
    // for each of the move planes, find the rotations that are relevant
    const moverotations: Quat[][] = [];
    for (let i = 0; i < moveplanesets.length; i++) {
      moverotations.push([]);
    }
    for (let i = 0; i < this.rotations.length; i++) {
      const q: Quat = this.rotations[i];
      if (Math.abs(Math.abs(q.a) - 1) < eps) {
        continue;
      }
      const qnormal = q.makenormal();
      for (let j = 0; j < moveplanesets.length; j++) {
        if (qnormal.sameplane(moveplanesets[j][0].makenormal())) {
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
      if (moverotations[i][0].dot(moveplanesets[i][0]) < 0) {
        r.reverse();
      }
    }
    const sizes2 = moverotations.map((_) => 1 + _.length);
    this.movesetorders = sizes2;
    const movesetgeos = [];
    for (let i = 0; i < moveplanesets.length; i++) {
      const p0 = moveplanesets[i][0].makenormal();
      let neg = null;
      let pos = null;
      for (let j = 0; j < this.geonormals.length; j++) {
        const d = p0.dot(this.geonormals[j][0]);
        if (Math.abs(d - 1) < eps) {
          pos = [this.geonormals[j][1], this.geonormals[j][2]];
        } else if (Math.abs(d + 1) < eps) {
          neg = [this.geonormals[j][1], this.geonormals[j][2]];
        }
      }
      if (pos === null || neg === null) {
        throw new Error("Saw positive or negative sides as null");
      }
      movesetgeos.push([pos[0], pos[1], neg[0], neg[1],
      1 + moveplanesets[i].length]);
    }
    this.movesetgeos = movesetgeos;
    //  Cubies are split by move plane sets.  For each cubie we can
    //  average its points to find a point on the interior of that
    //  cubie.  We can then check that point against all the move
    //  planes and from that derive a coordinate for the cubie.
    //  This also works for faces; no face should ever lie on a move
    //  plane.  This allows us to take a set of stickers and break
    //  them up into cubie sets.
    const cubiehash: any = {};
    const facelisthash: any = {};
    const cubiekey: any = {};
    const cubiekeys = [];
    const cubies: Quat[][][] = [];
    const faces = this.faces;
    for (let i = 0; i < faces.length; i++) {
      const face = faces[i];
      const s = this.keyface(face);
      if (!cubiehash[s]) {
        cubiekey[s] = cubies.length;
        cubiekeys.push(s);
        cubiehash[s] = [];
        facelisthash[s] = [];
        cubies.push(cubiehash[s]);
      }
      facelisthash[s].push(i);
      cubiehash[s].push(face);
      //  If we find a core cubie, split it up into multiple cubies,
      //  because ksolve doesn't handle orientations that are not
      //  cyclic, and the rotation group of the core is not cyclic.
      if (facelisthash[s].length === this.basefacecount) {
        if (this.verbose) { console.log("# Splitting core."); }
        for (let suff = 0; suff < this.basefacecount; suff++) {
          const s2 = s + " " + suff;
          facelisthash[s2] = [facelisthash[s][suff]];
          cubiehash[s2] = [cubiehash[s][suff]];
          cubiekeys.push(s2);
          cubiekey[s2] = cubies.length;
          cubies.push(cubiehash[s2]);
        }
        cubiehash[s] = [];
        cubies[cubiekey[s]] = [];
      }
    }
    this.cubiekey = cubiekey;
    this.facelisthash = facelisthash;
    this.cubiekeys = cubiekeys;
    if (this.verbose) { console.log("# Cubies: " + Object.keys(cubiehash).length); }
    const that = this;
    //  Sort the faces around each corner so they are clockwise.  Only
    //  relevant for cubies that actually are corners (three or more
    //  faces).  In general cubies might have many faces; for icosohedrons
    //  there are five faces on the corner cubies.
    this.cubies = cubies;
    for (let k = 0; k < cubies.length; k++) {
      const cubie = cubies[k];
      if (cubie.length < 2) {
        continue;
      }
      if (cubie.length === this.basefacecount) { // looks like core?  don't sort
        continue;
      }
      if (cubie.length > 5) {
        throw new Error("Bad math; too many faces on this cubie " + cubie.length);
      }
      const s = this.keyface(cubie[0]);
      const facelist = facelisthash[s];
      const cm = cubie.map((_) => centermassface(_));
      const cmall = centermassface(cm);
      for (let looplimit = 0; cubie.length > 2; looplimit++) {
        let changed = false;
        for (let i = 0; i < cubie.length; i++) {
          const j = (i + 1) % cubie.length;
          // var ttt = cmall.dot(cm[i].cross(cm[j])) ; // TODO
          if (cmall.dot(cm[i].cross(cm[j])) < 0) {
            const t = cubie[i];
            cubie[i] = cubie[j];
            cubie[j] = t;
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
          throw new Error(("Bad epsilon math; too close to border"));
        }
      }
      let mini = 0;
      let minf = this.findface(cubie[mini]);
      for (let i = 1; i < cubie.length; i++) {
        const temp = this.findface(cubie[i]);
        if (this.faceprecedence[this.getfaceindex(temp)] <
          this.faceprecedence[this.getfaceindex(minf)]) {
          mini = i;
          minf = temp;
        }
      }
      if (mini !== 0) {
        const ocubie = cubie.slice();
        const ofacelist = facelist.slice();
        for (let i = 0; i < cubie.length; i++) {
          cubie[i] = ocubie[(mini + i) % cubie.length];
          facelist[i] = ofacelist[(mini + i) % cubie.length];
        }
      }
    }
    //  Build an array that takes each face to a cubie ordinal and a
    //  face number.
    const facetocubies = [];
    for (let i = 0; i < cubies.length; i++) {
      const facelist = facelisthash[cubiekeys[i]];
      for (let j = 0; j < facelist.length; j++) {
        facetocubies[facelist[j]] = [i, j];
      }
    }
    this.facetocubies = facetocubies;
    //  Calculate the orbits of each cubie.  Assumes we do all moves.
    //  Also calculates which cubies are identical.
    const typenames = ["?", "CENTER", "EDGE", "CORNER", "C4RNER", "C5RNER"];
    const cubiesetnames = [];
    const cubietypecounts = [0, 0, 0, 0, 0, 0];
    const orbitoris = [];
    const seen = [];
    let cubiesetnum = 0;
    const cubiesetnums = [];
    const cubieordnums = [];
    const cubieords = [];
    // var cubiesetnumhash = {} ; // TODO
    const cubievaluemap = [];
    // Later we will make this smarter to use a get color for face function
    // so we support puzzles with multiple faces the same color
    function getcolorkey(cubienum: number): string {
      return cubies[cubienum].map(
        (_) => that.getfaceindex(that.findface(_))).join(" ");
    }
    const cubiesetcubies: any = [];
    for (let i = 0; i < cubies.length; i++) {
      if (seen[i]) {
        continue;
      }
      const cubie = cubies[i];
      if (cubie.length === 0) {
        continue;
      }
      const cubiekeymap: any = {};
      let cubievalueid = 0;
      cubieords.push(0);
      cubiesetcubies.push([]);
      const facecnt = cubie.length;
      const typectr = cubietypecounts[facecnt]++;
      let typename = typenames[facecnt];
      if (typename === undefined || facecnt === this.basefacecount) {
        typename = "CORE";
      }
      typename = typename + (typectr === 0 ? "" : (typectr + 1));
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
        for (let j = 0; j < moverotations.length; j++) {
          const tq = this.findcubie(moverotations[j][0].rotateface(cubies[cind][0]));
          if (!seen[tq]) {
            queue.push(tq);
            seen[tq] = true;
          }
        }
      }
      cubiesetnum++;
    }
    this.orbits = cubieords.length;
    this.cubiesetnums = cubiesetnums;
    this.cubieordnums = cubieordnums;
    this.cubiesetnames = cubiesetnames;
    this.cubieords = cubieords;
    this.orbitoris = orbitoris;
    this.cubievaluemap = cubievaluemap;
    this.cubiesetcubies = cubiesetcubies;
    // if we fix a cubie, find a cubie to fix
    if (this.fixPiece !== "") {
      for (let i = 0; i < cubies.length; i++) {
        if ((this.fixPiece === "v" && cubies[i].length > 2) ||
          (this.fixPiece === "e" && cubies[i].length === 2) ||
          (this.fixPiece === "f" && cubies[i].length === 1)) {
          this.fixedCubie = i;
          break;
        }
      }
      if (this.fixedCubie < 0) {
        throw new Error("Could not find a cubie of type " + this.fixPiece + " to fix.");
      }
    }
    // show the orbits
    if (this.verbose) { console.log("# Cubie orbit sizes " + cubieords); }
  }

  public spinmatch(a: string, b: string): boolean {
    // are these the same rotationally?
    if (a === b) {
      return true;
    }
    if (a.length !== b.length) {
      return false;
    }
    try {
      const e1 = splitByFaceNames(a, this.facenames);
      const e2 = splitByFaceNames(b, this.facenames);
      if (e1.length !== e2.length) {
        return false;
      }
      for (let i = 0; i < e1.length; i++) {
        if (e1[i] === e2[0]) {
          for (let j = 0; j < e2.length; j++) {
            if (e1[(i + j) % e1.length] !== e2[j]) {
              return false;
            }
          }
          return true;
        }
      }
      return false;
    } catch (e) {
      return false;
    }
  }

  public parsemove(mv: string): any { // parse a move from the command line
    const re = RegExp("^(([0-9]+)-)?([0-9]+)?([A-Za-z]+)([-'0-9]+)?$");
    const p = mv.match(re);
    if (p === null) {
      throw new Error("Bad move passed " + mv);
    }
    let grip = p[4];
    let fullrotation = false;
    if (grip.endsWith("v") && grip[0] <= "Z") {
      if (p[2] !== undefined || p[3] !== undefined) {
        throw new Error("Cannot use a prefix with full cube rotations");
      }
      grip = grip.slice(0, -1);
      fullrotation = true;
    }
    let geo;
    let msi = -1;
    const upperCaseGrip = grip.toUpperCase();
    let firstgrip = false;
    for (let i = 0; i < this.movesetgeos.length; i++) {
      const g = this.movesetgeos[i];
      if (this.spinmatch(g[0], upperCaseGrip)) {
        firstgrip = true;
        geo = g;
        msi = i;
      }
      if (this.spinmatch(g[2], upperCaseGrip)) {
        firstgrip = false;
        geo = g;
        msi = i;
      }
    }
    let loslice = 1;
    let hislice = 1;
    if (upperCaseGrip !== grip) {
      hislice = 2;
    }
    if (geo === undefined) {
      throw new Error("Bad grip in move " + mv);
    }
    if (p[2] !== undefined) {
      if (p[3] === undefined) {
        throw new Error("Missing second number in range");
      }
      loslice = parseInt(p[2], 10);
    }
    if (p[3] !== undefined) {
      if (p[2] === undefined) {
        hislice = parseInt(p[3], 10);
        if (upperCaseGrip === grip) {
          loslice = hislice;
        } else {
          loslice = 1;
        }
      } else {
        hislice = parseInt(p[3], 10);
      }
    }
    loslice--;
    hislice--;
    if (fullrotation) {
      loslice = 0;
      hislice = this.moveplanesets[msi].length;
    }
    if (loslice < 0 || loslice > this.moveplanesets[msi].length ||
      hislice < 0 || hislice > this.moveplanesets[msi].length) {
      throw new Error("Bad slice spec " + loslice + " " + hislice);
    }
    let amountstr = "1";
    let amount = 1;
    if (p[5] !== undefined) {
      amountstr = p[5];
      if (amountstr[0] === "'") {
        amountstr = "-" + amountstr.substring(1);
      }
      if (amountstr[0] === "+") {
        amountstr = amountstr.substring(1);
      } else if (amountstr[0] === "-") {
        if (amountstr === "-") {
          amountstr = "-1";
        }
      }
      amount = parseInt(amountstr, 10);
    }
    const r = [mv, msi, loslice, hislice, firstgrip, amount];
    return r;
  }

  public genperms(): void { // generate permutations for moves
    if (this.cmovesbyslice.length > 0) { // did this already?
      return;
    }
    const movesbyslice = [];
    const cmovesbyslice = [];
    for (let k = 0; k < this.moveplanesets.length; k++) {
      const moveplaneset = this.moveplanesets[k];
      const slicenum = [];
      const slicecnts = [];
      for (let i = 0; i < this.faces.length; i++) {
        const face = this.faces[i];
        let t = 0;
        for (let j = 0; j < moveplaneset.length; j++) {
          if (moveplaneset[j].faceside(face) < 0) {
            t++;
          }
        }
        slicenum.push(t);
        while (slicecnts.length <= t) {
          slicecnts.push(0);
        }
        slicecnts[t]++;
      }
      const axismoves = [];
      const axiscmoves = [];
      for (let sc = 0; sc < slicecnts.length; sc++) {
        const slicemoves = [];
        const slicecmoves = [];
        const cubiedone = [];
        for (let i = 0; i < this.faces.length; i++) {
          if (slicenum[i] !== sc) {
            continue;
          }
          const a = [i];
          const b = this.facetocubies[i].slice();
          let face = this.faces[i];
          let fi2 = i;
          while (true) {
            slicenum[fi2] = -1;
            const face2 = this.moverotations[k][0].rotateface(face);
            fi2 = this.findface(face2);
            if (slicenum[fi2] < 0) {
              break;
            }
            if (slicenum[fi2] !== sc) {
              throw new Error("Bad movement?");
            }
            a.push(fi2);
            const c = this.facetocubies[fi2];
            b.push(c[0], c[1]);
            face = face2;
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
          if (a.length > 1 && this.orientCenters &&
              (this.cubies[b[0]].length === 1 ||
               this.cubies[b[0]][0] === this.cubies[b[0]][1])) {
             // is this a real center cubie, around an axis?
             if (centermassface(this.faces[i]).dist(centermassface(this.basefaces[this.getfaceindex(i)])) < eps) {
               // how does remapping of the face/point set map to the original?
               let face1 = this.faces[a[0]] ;
               for (let ii = 0; ii < a.length; ii++) {
                 const face0 = this.faces[a[ii]] ;
                 let o = -1 ;
                 for (let jj = 0; jj < face1.length; jj++) {
                   if (face0[jj].dist(face1[0]) < eps) {
                     o = jj ;
                     break ;
                   }
                 }
                 if (o < 0) {
                   throw new Error("Couldn't find rotation of center faces.") ;
                 }
                 b[2 * ii + 1] = o ;
                 face1 = this.moverotations[k][0].rotateface(face1) ;
               }
             }
          }
          // a.length == 1 means a sticker is spinning in place.
          // in this case we add duplicate stickers and fake the orientation
          // so that we can make it animate properly in a 3D world.
          if (a.length === 1 && this.orientCenters) {
            for (let ii = 1; ii < this.movesetorders[k]; ii++) {
              a.push(a[0]);
              if (sc === 0) {
                b.push(b[0], ii);
              } else {
                b.push(b[0], (this.movesetorders[k] - ii) % this.movesetorders[k]);
              }
              this.cubies[b[0]].push(this.cubies[b[0]][0]);
            }
            this.duplicatedFaces[a[0]] = this.movesetorders[k];
            this.duplicatedCubies[b[0]] = this.movesetorders[k];
            this.orbitoris[this.cubiesetnums[b[0]]] = this.movesetorders[k];
          }
          if (a.length > 1) {
            slicemoves.push(a);
          }
          if (b.length > 2 && !cubiedone[b[0]]) {
            slicecmoves.push(b);
          }
          for (let j = 0; j < b.length; j += 2) {
            cubiedone[b[j]] = true;
          }
        }
        axismoves.push(slicemoves);
        axiscmoves.push(slicecmoves);
      }
      movesbyslice.push(axismoves);
      cmovesbyslice.push(axiscmoves);
    }
    this.movesbyslice = movesbyslice;
    this.cmovesbyslice = cmovesbyslice;
    if (this.movelist !== undefined) {
      const parsedmovelist: any[] = [];
      // make sure the movelist makes sense based on the geos.
      for (let i = 0; i < this.movelist.length; i++) {
        parsedmovelist.push(this.parsemove(this.movelist[i]));
      }
      this.parsedmovelist = parsedmovelist;
    }
  }

  public getfaces(): number[][][] { // get the faces for 3d.
    return this.faces.map((_) => {
      return _.map((__) => [__.b, __.c, __.d]);
    });
  }

  public getboundarygeometry(): any { // get the boundary geometry
    return {
      baseplanes: this.baseplanes,
      facenames: this.facenames,
      faceplanes: this.faceplanes,
      vertexnames: this.vertexnames,
      edgenames: this.edgenames,
      geonormals: this.geonormals,
    };
  }

  public getmovesets(k: number): any {
    // get the move sets we support based on slices
    // for even values we omit the middle "slice".  This isn't perfect
    // but it is what we do for now.
    // if there was a move list specified, pull values from that
    const slices = this.moveplanesets[k].length;
    if (slices > 30) {
      throw new Error("Too many slices for getmovesets bitmasks");
    }
    let r = [];
    if (this.parsedmovelist !== undefined) {
      for (let i = 0; i < this.parsedmovelist.length; i++) {
        const parsedmove = this.parsedmovelist[i];
        if (parsedmove[1] !== k) {
          continue;
        }
        if (parsedmove[4]) {
          r.push((2 << parsedmove[3]) - (1 << parsedmove[2]));
        } else {
          r.push((2 << (slices - parsedmove[2])) - (1 << (slices - parsedmove[3])));
        }
        r.push(parsedmove[5]);
      }
    } else if (this.vertexmoves && !this.allmoves) {
      const msg = this.movesetgeos[k];
      if (msg[1] !== msg[3]) {
        for (let i = 0; i < slices; i++) {
          if (msg[1] !== "v") {
            if (this.outerblockmoves) {
              r.push((2 << slices) - (2 << i));
            } else {
              r.push(2 << i);
            }
            r.push(1);
          } else {
            if (this.outerblockmoves) {
              r.push((2 << i) - 1);
            } else {
              r.push(1 << i);
            }
            r.push(1);
          }
        }
      }
    } else {
      for (let i = 0; i <= slices; i++) {
        if (!this.allmoves && i + i === slices) {
          continue;
        }
        if (this.outerblockmoves) {
          if (i + i > slices) {
            r.push((2 << slices) - (1 << i));
          } else {
            r.push((2 << i) - 1);
          }
        } else {
          r.push(1 << i);
        }
        r.push(1);
      }
    }
    if (this.fixedCubie >= 0) {
      const dep = 1 << +this.cubiekeys[this.fixedCubie].trim().split(" ")[k];
      const newr = [];
      for (let i = 0; i < r.length; i += 2) {
        let o = r[i];
        if (o & dep) {
          o = (2 << slices) - 1 - o;
        }
        let found = false;
        for (let j = 0; j < newr.length; j += 2) {
          if (newr[j] === o && newr[j + 1] === r[i + 1]) {
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
    if (this.addrotations) {
      r.push((2 << slices) - 1);
      r.push(1);
    }
    return r;
  }

  public graybyori(cubie: number): boolean {
    let ori = this.cubies[cubie].length;
    if (this.duplicatedCubies[cubie]) {
      ori = 1;
    }
    return ((ori === 1 && (this.graycenters || !this.centersets)) ||
      (ori === 2 && (this.grayedges || !this.edgesets)) ||
      (ori > 2 && (this.graycorners || !this.cornersets)));
  }

  public skipbyori(cubie: number): boolean {
    let ori = this.cubies[cubie].length;
    if (this.duplicatedCubies[cubie]) {
      ori = 1;
    }
    return ((ori === 1 && !this.centersets) ||
      (ori === 2 && !this.edgesets) ||
      (ori > 2 && !this.cornersets));
  }

  public skipcubie(set: number[]): boolean {
    if (set.length === 0) {
      return true;
    }
    const fi = set[0];
    return this.skipbyori(fi);
  }

  public skipset(set: number[]): boolean {
    if (set.length === 0) {
      return true;
    }
    const fi = set[0];
    return this.skipbyori(this.facetocubies[fi][0]);
  }

  public header(comment: string): string {
    return comment + copyright + "\n" +
      comment + this.args + "\n";
  }

  public writegap(): string { // write out a gap set of generators
    const os = this.getOrbitsDef(false);
    const r = [];
    const mvs = [];
    for (let i = 0; i < os.moveops.length; i++) {
      const movename = "M_" + os.movenames[i];
      // gap doesn't like angle brackets in IDs
      mvs.push(movename);
      r.push(movename + ":=" + os.moveops[i].toPerm().toGap() + ";");
    }
    r.push("Gen:=[");
    r.push(mvs.join(","));
    r.push("];");
    const ip = os.solved.identicalPieces();
    r.push("ip:=[" + ip.map((_) => "[" + _.map((__) => __ + 1).join(",") + "]").
      join(",") + "];");
    r.push("");
    return this.header("# ") + r.join("\n");
  }

  public writeksolve(name: string = "PuzzleGeometryPuzzle", fortwisty: boolean = false): string {
    const od = this.getOrbitsDef(fortwisty);
    if (fortwisty) {
      return od.toKsolve(name, fortwisty).join("\n");
    } else {
      return this.header("# ") + od.toKsolve(name, fortwisty).join("\n");
    }
  }
  public writekpuzzle(fortwisty: boolean = true): any {
    return this.getOrbitsDef(fortwisty).toKpuzzle();
  }

  public getOrbitsDef(fortwisty: boolean): OrbitsDef {
    // generate a representation of the puzzle
    const setmoves = [];
    const setnames: string[] = [];
    const setdefs: OrbitDef[] = [];
    for (let k = 0; k < this.moveplanesets.length; k++) {
      const moveset = this.getmovesets(k);
      // check there's no redundancy in moveset.
      for (let i = 0; i < moveset.length; i += 2) {
        for (let j = 0; j < i; j += 2) {
          if (moveset[i] === moveset[j] && moveset[i + 1] === moveset[j + 1]) {
            throw new Error("Redundant moves in moveset.");
          }
        }
      }
      let allbits = 0;
      for (let i = 0; i < moveset.length; i += 2) {
        allbits |= moveset[i];
      }
      const axiscmoves = this.cmovesbyslice[k];
      for (let i = 0; i < axiscmoves.length; i++) {
        if (((allbits >> i) & 1) === 0) {
          continue;
        }
        const slicecmoves = axiscmoves[i];
        for (let j = 0; j < slicecmoves.length; j++) {
          if (this.skipcubie(slicecmoves[j])) {
            continue;
          }
          const ind = this.cubiesetnums[slicecmoves[j][0]];
          setmoves[ind] = 1;
        }
      }
    }
    for (let i = 0; i < this.cubiesetnames.length; i++) {
      if (!setmoves[i]) {
        continue;
      }
      setnames.push(this.cubiesetnames[i]);
      setdefs.push(new OrbitDef(this.cubieords[i],
        this.killorientation ? 1 : this.orbitoris[i]));
    }
    const solved: Orbit[] = [];
    for (let i = 0; i < this.cubiesetnames.length; i++) {
      if (!setmoves[i]) {
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
      solved.push(new Orbit(p, o,
        this.killorientation ? 1 : this.orbitoris[i]));
    }
    const movenames: string[] = [];
    const moves: Transformation[] = [];
    for (let k = 0; k < this.moveplanesets.length; k++) {
      const moveplaneset = this.moveplanesets[k];
      const slices = moveplaneset.length;
      const moveset = this.getmovesets(k);
      const movesetgeo = this.movesetgeos[k];
      for (let i = 0; i < moveset.length; i += 2) {
        const movebits = moveset[i];
        const mna = getmovename(movesetgeo, movebits, slices);
        const movename = mna[0];
        const inverted = mna[1];
        movenames.push(movename);
        const moveorbits: Orbit[] = [];
        const perms = [];
        const oris = [];
        for (let ii = 0; ii < this.cubiesetnames.length; ii++) {
          const p = [];
          for (let kk = 0; kk < this.cubieords[ii]; kk++) {
            p.push(kk);
          }
          perms.push(p);
          const o = [];
          for (let kk = 0; kk < this.cubieords[ii]; kk++) {
            o.push(0);
          }
          oris.push(o);
        }
        const axiscmoves = this.cmovesbyslice[k];
        for (let m = 0; m < axiscmoves.length; m++) {
          if (((movebits >> m) & 1) === 0) {
            continue;
          }
          const slicecmoves = axiscmoves[m];
          for (let j = 0; j < slicecmoves.length; j++) {
            const mperm = slicecmoves[j].slice();
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
            for (let ii = 0; ii < mperm.length; ii += 2) {
              perms[setnum][mperm[(ii + inc) % mperm.length]] = mperm[ii];
              if (this.killorientation) {
                oris[setnum][mperm[ii]] = 0;
              } else {
                oris[setnum][mperm[ii]] =
                  (mperm[(ii + oinc) % mperm.length] -
                    mperm[(ii + 1) % mperm.length] +
                    this.orbitoris[setnum]) % this.orbitoris[setnum];
              }
            }
          }
        }
        for (let ii = 0; ii < this.cubiesetnames.length; ii++) {
          if (!setmoves[ii]) {
            continue;
          }
          const no = new Array<number>(oris[ii].length);
          // convert ksolve oris to our internal ori rep
          for (let jj = 0; jj < perms[ii].length; jj++) {
            no[jj] = oris[ii][perms[ii][jj]];
          }
          moveorbits.push(new Orbit(perms[ii], no,
            this.killorientation ? 1 : this.orbitoris[ii]));
        }
        let mv = new Transformation(moveorbits);
        if (moveset[i + 1] !== 1) {
          mv = mv.mulScalar(moveset[i + 1]);
        }
        moves.push(mv);
      }
    }
    this.ksolvemovenames = movenames; // hack!
    let r = new OrbitsDef(setnames, setdefs, new VisibleState(solved),
      movenames, moves);
    if (this.optimize) {
      r = r.optimize();
    }
    if (this.scramble !== 0) {
      r.scramble(this.scramble);
    }
    return r;
  }

  public getMovesAsPerms(): Perm[] {
    return this.getOrbitsDef(false).moveops.
      map((_: Transformation) => _.toPerm());
  }

  public showcanon(disp: (s: string) => void): void {
    // show information for canonical move derivation
    showcanon(this.getOrbitsDef(false), disp);
  }

  public getsolved(): Perm { // get a solved position
    const r = [];
    for (let i = 0; i < this.basefacecount; i++) {
      for (let j = 0; j < this.stickersperface; j++) {
        r.push(i);
      }
    }
    return new Perm(r);
  }

  public getInitial3DRotation() {
    const basefacecount = this.basefacecount;
    if (basefacecount === 4) {
      return new Quat(0.7043069543230507, 0.0617237605829268,
        0.4546068756768417, 0.5417328493446099);
    } else if (basefacecount === 6) {
      return new Quat(0.3419476009844782, 0.17612448544695208,
        -0.42284908551877964, 0.8205185279339757);
    } else if (basefacecount === 8) {
      return new Quat(-0.6523285484575103, 0.2707374015470506,
        0.6537994145576647, 0.27150515611112014);
    } else if (basefacecount === 12) {
      return new Quat(-0.5856747836703331, 0.02634133605619232,
        0.7075560342412421, 0.39453217891103587);
    } else if (basefacecount === 20) {
      return new Quat(0.7052782621769977, 0.6377976252204238,
        0.30390357803973855, 0.05864620549043545);
    } else {
      throw new Error("Wrong base face count");
    }
  }

  public generatesvg(w: number = 800, h: number = 500, trim: number = 10, threed: boolean = false): string {
    // generate svg to interoperate with Lucas twistysim
    w -= 2 * trim;
    h -= 2 * trim;
    function extendedges(a: number[][], n: number): void {
      let dx = a[1][0] - a[0][0];
      let dy = a[1][1] - a[0][1];
      const ang = 2 * Math.PI / n;
      const cosa = Math.cos(ang);
      const sina = Math.sin(ang);
      for (let i = 2; i < n; i++) {
        const ndx = dx * cosa + dy * sina;
        dy = dy * cosa - dx * sina;
        dx = ndx;
        a.push([a[i - 1][0] + dx, a[i - 1][1] + dy]);
      }
    }
    // if we don't add this noise to coordinate values, then Safari
    // doesn't render our polygons correctly.  What a hack.
    function noise(c: number): number {
      return c + 0 * (Math.random() - 0.5);
    }
    function drawedges(id: string, pts: number[][], color: string)
      : string {
      return "<polygon id=\"" + id + "\" class=\"sticker\" style=\"fill: " + color +
        "\" points=\"" +
        pts.map((p) => noise(p[0]) + " " + noise(p[1])).join(" ") +
        "\"/>\n";
    }
    // What grips do we need?  if rotations, add all grips.
    let needvertexgrips = this.addrotations;
    let neededgegrips = this.addrotations;
    let needfacegrips = this.addrotations;
    for (let i = 0; i < this.movesetgeos.length; i++) {
      const msg = this.movesetgeos[i];
      for (let j = 1; j <= 3; j += 2) {
        if (msg[j] === "v") {
          needvertexgrips = true;
        }
        if (msg[j] === "f") {
          needfacegrips = true;
        }
        if (msg[j] === "e") {
          neededgegrips = true;
        }
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
    edges[net[0][0]] = [[1, 0], [0, 0]];
    extendedges(edges[net[0][0]], polyn);
    for (let i = 0; i < net.length; i++) {
      const f0 = net[i][0];
      if (!edges[f0]) {
        throw new Error("Bad edge description; first edge not connected.");
      }
      for (let j = 1; j < net[i].length; j++) {
        const f1 = net[i][j];
        if (f1 === "" || edges[f1]) {
          continue;
        }
        edges[f1] = [edges[f0][j % polyn], edges[f0][(j + polyn - 1) % polyn]];
        extendedges(edges[f1], polyn);
      }
    }
    for (const f in edges) {
      const es = edges[f];
      for (let i = 0; i < es.length; i++) {
        minx = Math.min(minx, es[i][0]);
        maxx = Math.max(maxx, es[i][0]);
        miny = Math.min(miny, es[i][1]);
        maxy = Math.max(maxy, es[i][1]);
      }
    }
    const sc = Math.min(w / (maxx - minx), h / (maxy - miny));
    const xoff = 0.5 * (w - sc * (maxx + minx));
    const yoff = 0.5 * (h - sc * (maxy + miny));
    const geos: any = {};
    const bg = this.getboundarygeometry();
    const edges2: any = {};
    const initv = [[sc + xoff, yoff], [xoff, yoff]];
    edges2[net[0][0]] = initv;
    extendedges(edges2[net[0][0]], polyn);
    geos[this.facenames[0][1]] = this.project2d(0, 0,
      [new Quat(0, initv[0][0], initv[0][1], 0),
      new Quat(0, initv[1][0], initv[1][1], 0)]);
    const connectat = [];
    connectat[0] = 0;
    for (let i = 0; i < net.length; i++) {
      const f0 = net[i][0];
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
        throw new Error("Could not find first face name " + f0);
      }
      const thisface = bg.facenames[gfi][0];
      for (let j = 1; j < net[i].length; j++) {
        const f1 = net[i][j];
        if (f1 === "" || edges2[f1]) {
          continue;
        }
        edges2[f1] = [edges2[f0][j % polyn], edges2[f0][(j + polyn - 1) % polyn]];
        extendedges(edges2[f1], polyn);
        // what edge are we at?
        const caf0 = connectat[gfi];
        const mp = thisface[(caf0 + j) % polyn].sum(thisface[(caf0 + j + polyn - 1) % polyn]).smul(0.5);
        const epi = findelement(bg.edgenames, mp);
        const edgename = bg.edgenames[epi][1];
        const el = splitByFaceNames(edgename, this.facenames);
        const gf1 = el[(f0 === el[0]) ? 1 : 0];
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
            geos[gf1] = this.project2d(gf1i, k,
              [new Quat(0, p2[0], p2[1], 0), new Quat(0, p1[0], p1[1], 0)]);
            break;
          }
        }
      }
    }
    // Let's build arrays for faster rendering.  We want to map from geo
    // base face number to color, and we want to map from geo face number
    // to 2D geometry.  These can be reused as long as the puzzle overall
    // orientation and canvas size remains unchanged.
    const pos = this.getsolved();
    const colormap = [];
    const facegeo = [];
    for (let i = 0; i < this.basefacecount; i++) {
      colormap[i] = this.colors[this.facenames[i][1]];
    }
    let hix = 0;
    let hiy = 0;
    const rot = this.getInitial3DRotation();
    for (let i = 0; i < this.faces.length; i++) {
      let face = this.faces[i];
      face = rot.rotateface(face);
      for (let j = 0; j < face.length; j++) {
        hix = Math.max(hix, Math.abs(face[j].b));
        hiy = Math.max(hiy, Math.abs(face[j].c));
      }
    }
    const sc2 = Math.min(h / hiy / 2, (w - trim) / hix / 4);
    const that = this;
    function mappt2d(fn: number, q: Quat): number[] {
      if (threed) {
        const xoff2 = 0.5 * trim + 0.25 * w;
        const xmul = (that.baseplanes[fn].rotateplane(rot).d < 0 ? 1 : -1);
        return [trim + w * 0.5 + xmul * (xoff2 - q.b * sc2), trim + h * 0.5 + q.c * sc2];
      } else {
        const g = geos[that.facenames[fn][1]];
        return [trim + q.dot(g[0]) + g[2].b, trim + h - q.dot(g[1]) - g[2].c];
      }
    }
    for (let i = 0; i < this.faces.length; i++) {
      let face = that.faces[i];
      const facenum = Math.floor(i / that.stickersperface);
      if (threed) {
        face = rot.rotateface(face);
      }
      facegeo.push(face.map((_: Quat) => mappt2d(facenum, _)));
    }
    const svg = [];
    // group each base face so we can add a hover element
    for (let j = 0; j < this.basefacecount; j++) {
      svg.push("<g>");
      svg.push("<title>" + this.facenames[j][1] + "</title>\n");
      for (let ii = 0; ii < this.stickersperface; ii++) {
        const i = j * this.stickersperface + ii;
        const cubie = this.facetocubies[i][0];
        const cubieori = this.facetocubies[i][1];
        const cubiesetnum = this.cubiesetnums[cubie];
        const cubieord = this.cubieordnums[cubie];
        const color = this.graybyori(cubie) ? "#808080" : colormap[pos.p[i]];
        let id = this.cubiesetnames[cubiesetnum] +
          "-l" + cubieord + "-o" + cubieori;
        svg.push(drawedges(id, facegeo[i], color));
        if (this.duplicatedFaces[i]) {
          for (let jj = 1; jj < this.duplicatedFaces[i]; jj++) {
            id = this.cubiesetnames[cubiesetnum] +
              "-l" + cubieord + "-o" + jj;
            svg.push(drawedges(id, facegeo[i], color));
          }
        }
      }
      svg.push("</g>");
    }
    const svggrips: any[] = [];
    function addgrip(onface: number, name: string, pt: Quat, order: number): void {
      const pt2 = mappt2d(onface, pt);
      for (let i = 0; i < svggrips.length; i++) {
        if (Math.hypot(pt2[0] - svggrips[i][0], pt2[1] - svggrips[i][1]) < eps) {
          return;
        }
      }
      svggrips.push([pt2[0], pt2[1], name, order]);
    }
    for (let i = 0; i < this.faceplanes.length; i++) {
      const baseface = this.facenames[i][0];
      let facecoords = baseface;
      if (threed) {
        facecoords = rot.rotateface(facecoords);
      }
      if (needfacegrips) {
        let pt = this.faceplanes[i][0];
        if (threed) {
          pt = pt.rotatepoint(rot);
        }
        addgrip(i, this.faceplanes[i][1], pt, polyn);
      }
      for (let j = 0; j < baseface.length; j++) {
        if (neededgegrips) {
          const mp = baseface[j].sum(
            baseface[(j + 1) % baseface.length]).smul(0.5);
          const ep = findelement(this.edgenames, mp);
          const mpc = facecoords[j].sum(
            facecoords[(j + 1) % baseface.length]).smul(0.5);
          addgrip(i, this.edgenames[ep][1], mpc, 2);
        }
        if (needvertexgrips) {
          const vp = findelement(
            this.vertexnames, baseface[j]);
          addgrip(i, this.vertexnames[vp][1], facecoords[j],
            this.cornerfaces);
        }
      }
    }
    const html = '<svg id="svg" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 800 500">\n' +
      '<style type="text/css"><![CDATA[' +
      ".sticker { stroke: #000000; stroke-width: 1px; }" +
      "]]></style>\n" +
      svg.join("") + "</svg>";
    this.svggrips = svggrips;
    return html;
  }

  public get3d(trim?: number): StickerDat {
    const stickers: any = [];
    const rot = this.getInitial3DRotation();
    const faces: any = [];
    const maxdist: number = 0.52 * this.basefaces[0][0].len();
    for (let i = 0; i < this.basefaces.length; i++) {
      const coords = rot.rotateface(this.basefaces[i]);
      const name = this.facenames[i][1];
      faces.push({ coords: toFaceCoords(coords, maxdist), name });
    }
    for (let i = 0; i < this.faces.length; i++) {
      const facenum = Math.floor(i / this.stickersperface);
      const cubie = this.facetocubies[i][0];
      const cubieori = this.facetocubies[i][1];
      const cubiesetnum = this.cubiesetnums[cubie];
      const cubieord = this.cubieordnums[cubie];
      const color = this.graybyori(cubie) ? "#808080" :
        this.colors[this.facenames[facenum][1]];
      let coords = rot.rotateface(this.faces[i]);
      if (trim && trim > 0) {
        coords = trimEdges(coords, trim);
      }
      stickers.push({
        coords: toFaceCoords(coords, maxdist),
        color, orbit: this.cubiesetnames[cubiesetnum],
        ord: cubieord, ori: cubieori,
      });
      if (this.duplicatedFaces[i]) {
        for (let jj = 1; jj < this.duplicatedFaces[i]; jj++) {
          stickers.push({
            coords: toFaceCoords(coords, maxdist),
            color, orbit: this.cubiesetnames[cubiesetnum],
            ord: cubieord, ori: jj,
          });
        }
      }
    }
    const grips: StickerDatAxis[] = [];
    for (let i = 0; i < this.movesetgeos.length; i++) {
      const msg = this.movesetgeos[i];
      const order = this.movesetorders[i];
      for (let j = 0; j < this.geonormals.length; j++) {
        const gn = this.geonormals[j];
        if (msg[0] === gn[1] && msg[1] === gn[2]) {
          grips.push([toCoords(gn[0].rotatepoint(rot), 1),
          msg[0], order]);
          grips.push([toCoords(gn[0].rotatepoint(rot).smul(-1), 1),
          msg[2], order]);
        }
      }
    }
    return { stickers, faces, axis: grips };
  }

  private getfaceindex(facenum: number): number {
    const divid = this.stickersperface;
    return Math.floor(facenum / divid);
  }
}
