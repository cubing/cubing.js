 
export declare function expandfaces(rots: Quat[], faces: Quat[][]): Quat[][];
export declare function centermassface(face: Quat[]): Quat;
export declare function random(): Quat;
export declare function solvethreeplanes(p1: number, p2: number, p3: number, planes: Quat[]): any;
export declare class Quat {
    a: number;
    b: number;
    c: number;
    d: number;
    constructor(a: number, b: number, c: number, d: number);
    mul(q: Quat): Quat;
    toString(): string;
    dist(q: Quat): number;
    len(): number;
    cross(q: Quat): Quat;
    dot(q: Quat): number;
    normalize(): Quat;
    makenormal(): Quat;
    normalizeplane(): Quat;
    smul(m: number): Quat;
    sum(q: Quat): Quat;
    sub(q: Quat): Quat;
    angle(): number;
    invrot(): Quat;
    det3x3(a00: number, a01: number, a02: number, a10: number, a11: number, a12: number, a20: number, a21: number, a22: number): number;
    rotateplane(q: Quat): Quat;
    rotatepoint(q: Quat): Quat;
    rotateface(face: Quat[]): Quat[];
    rotatecubie(cubie: Quat[][]): Quat[][];
    intersect3(p2: Quat, p3: Quat): Quat | false;
    side(x: number): number;
    cutfaces(faces: Quat[][]): Quat[][];
    faceside(face: Quat[]): number;
    sameplane(p: Quat): boolean;
    makecut(r: number): Quat;
}
//# sourceMappingURL=Quat.d.ts.map