 
 
 
import { Perm } from "./Perm";
import { OrbitsDef } from "./PermOriSet";
import { PuzzleDescriptionString } from "./Puzzles";
import { Quat } from "./Quat";
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
export declare type StickerDatAxis = [number[], string, number];
export interface StickerDat {
    stickers: StickerDatSticker[];
    faces: StickerDatFace[];
    axis: StickerDatAxis[];
}
export declare function getpuzzles(): {
    [s: string]: PuzzleDescriptionString;
};
export declare function getpuzzle(puzzleName: PuzzleName): PuzzleDescriptionString;
export declare function parsedesc(s: string): any;
declare type PuzzleName = "2x2x2" | "3x3x3" | "4x4x4" | "5x5x5" | "6x6x6" | "7x7x7" | "8x8x8" | "9x9x9" | "10x10x10" | "11x11x11" | "12x12x12" | "13x13x13" | "20x20x20" | "skewb" | "master skewb" | "professor skewb" | "compy cube" | "helicopter" | "dino" | "little chop" | "pyramorphix" | "mastermorphix" | "pyraminx" | "Jing pyraminx" | "master paramorphix" | "megaminx" | "gigaminx" | "pentultimate" | "starminx" | "starminx 2" | "pyraminx crystal" | "chopasaurus" | "big chop" | "skewb diamond" | "FTO" | "Christopher's jewel" | "octastar" | "Trajber's octahedron" | "radio chop" | "icosamate" | "icosahedron 2" | "icosahedron 3" | "icosahedron static faces" | "icosahedron moving faces" | "Eita";
export declare function getPuzzleGeometryByDesc(desc: string, options?: string[]): PuzzleGeometry;
export declare function getPuzzleGeometryByName(puzzleName: PuzzleName, options?: string[]): PuzzleGeometry;
export declare class PuzzleGeometry {
    args: string;
    rotations: Quat[];
    baseplanerot: Quat[];
    baseplanes: Quat[];
    facenames: any[];
    faceplanes: any;
    edgenames: any[];
    vertexnames: any[];
    geonormals: any[];
    moveplanes: Quat[];
    moveplanesets: any[];
    movesetorders: any[];
    movesetgeos: any[];
    basefaces: Quat[][];
    faces: Quat[][];
    basefacecount: number;
    stickersperface: number;
    cornerfaces: number;
    cubies: any[];
    shortedge: number;
    vertexdistance: number;
    edgedistance: number;
    orbits: number;
    facetocubies: any[];
    moverotations: Quat[][];
    cubiekey: any;
    cubiekeys: string[];
    facelisthash: any;
    cubiesetnames: any[];
    cubieords: number[];
    cubiesetnums: number[];
    cubieordnums: number[];
    orbitoris: number[];
    cubievaluemap: number[];
    cubiesetcubies: number[][];
    movesbyslice: any[];
    cmovesbyslice: any[];
    verbose: number;
    allmoves: boolean;
    outerblockmoves: boolean;
    vertexmoves: boolean;
    addrotations: boolean;
    movelist: any;
    parsedmovelist: any;
    cornersets: boolean;
    centersets: boolean;
    edgesets: boolean;
    graycorners: boolean;
    graycenters: boolean;
    grayedges: boolean;
    killorientation: boolean;
    optimize: boolean;
    scramble: number;
    ksolvemovenames: string[];
    fixPiece: string;
    orientCenters: boolean;
    duplicatedFaces: number[];
    duplicatedCubies: number[];
    fixedCubie: number;
    svggrips: any[];
    net: any;
    colors: any;
    faceorder: any;
    faceprecedence: number[];
    constructor(shape: string, cuts: string[][], optionlist: any[] | undefined);
    create(shape: string, cuts: any[]): void;
    keyface(face: Quat[]): string;
    findcubie(face: Quat[]): number;
    findface(face: Quat[]): number;
    project2d(facen: number, edgen: number, targvec: Quat[]): any;
    allstickers(): void;
    spinmatch(a: string, b: string): boolean;
    parsemove(mv: string): any;
    genperms(): void;
    getfaces(): number[][][];
    getboundarygeometry(): any;
    getmovesets(k: number): any;
    graybyori(cubie: number): boolean;
    skipbyori(cubie: number): boolean;
    skipcubie(set: number[]): boolean;
    skipset(set: number[]): boolean;
    header(comment: string): string;
    writegap(): string;
    writeksolve(name?: string, fortwisty?: boolean): string;
    writekpuzzle(): any;
    getOrbitsDef(fortwisty: boolean): OrbitsDef;
    getMovesAsPerms(): Perm[];
    showcanon(disp: (s: string) => void): void;
    getsolved(): Perm;
    getInitial3DRotation(): Quat;
    generatesvg(w?: number, h?: number, trim?: number, threed?: boolean): string;
    get3d(trim?: number): StickerDat;
}
export {};
//# sourceMappingURL=PuzzleGeometry.d.ts.map