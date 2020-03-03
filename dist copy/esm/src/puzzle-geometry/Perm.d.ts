export declare function zeros(n: number): number[];
export declare function iota(n: number): number[];
export declare function identity(n: number): Perm;
export declare function random(n: number): Perm;
export declare function factorial(a: number): number;
export declare function lcm(a: number, b: number): number;
export declare class Perm {
    n: number;
    p: number[];
    constructor(a: number[]);
    toString(): string;
    mul(p2: Perm): Perm;
    rmul(p2: Perm): Perm;
    inv(): Perm;
    compareTo(p2: Perm): number;
    toGap(): string;
    order(): number;
}
//# sourceMappingURL=Perm.d.ts.map