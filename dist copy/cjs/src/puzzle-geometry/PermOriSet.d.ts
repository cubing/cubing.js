 
import { Perm } from "./Perm";
export declare class OrbitDef {
    size: number;
    mod: number;
    constructor(size: number, mod: number);
    reassemblySize(): number;
}
export declare class OrbitsDef {
    orbitnames: string[];
    orbitdefs: OrbitDef[];
    solved: VisibleState;
    movenames: string[];
    moveops: Transformation[];
    constructor(orbitnames: string[], orbitdefs: OrbitDef[], solved: VisibleState, movenames: string[], moveops: Transformation[]);
    toKsolve(name: string, forTwisty: boolean): string[];
    toKpuzzle(): object;
    optimize(): OrbitsDef;
    scramble(n: number): void;
    reassemblySize(): number;
}
export declare class Orbit {
    perm: number[];
    ori: number[];
    orimod: number;
    static e(n: number, mod: number): Orbit;
    constructor(perm: number[], ori: number[], orimod: number);
    mul(b: Orbit): Orbit;
    inv(): Orbit;
    equal(b: Orbit): boolean;
    killOri(): this;
    toPerm(): Perm;
    identicalPieces(): number[][];
    order(): number;
    isIdentity(): boolean;
    remap(no: number[], on: number[], nv: number): Orbit;
    remapVS(no: number[], nv: number): Orbit;
    toKsolveVS(): string[];
    toKsolve(): string[];
    toKpuzzle(): object;
}
export declare class TransformationBase {
    orbits: Orbit[];
    constructor(orbits: Orbit[]);
    internalMul(b: TransformationBase): Orbit[];
    internalInv(): Orbit[];
    equal(b: TransformationBase): boolean;
    killOri(): this;
    toPerm(): Perm;
    identicalPieces(): number[][];
    order(): number;
}
export declare class Transformation extends TransformationBase {
    constructor(orbits: Orbit[]);
    mul(b: Transformation): Transformation;
    mulScalar(n: number): Transformation;
    inv(): Transformation;
    e(): Transformation;
}
export declare class VisibleState extends TransformationBase {
    constructor(orbits: Orbit[]);
    mul(b: Transformation): VisibleState;
}
export declare function showcanon(g: OrbitsDef, disp: (s: string) => void): void;
export declare function showcanon0(g: OrbitsDef, disp: (s: string) => void): void;
//# sourceMappingURL=PermOriSet.d.ts.map