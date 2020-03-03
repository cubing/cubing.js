export declare type AlgPartType = string;
export declare abstract class AlgPart {
    abstract type: AlgPartType;
}
export declare function matchesAlgType<T extends AlgPart>(a: any, t: AlgPartType): boolean;
export declare function assertMatchesType<T extends AlgPart>(a: any, t: AlgPartType): T;
export declare function isUnit(a: AlgPart): boolean;
export declare function assertIsUnit(a: AlgPart): Unit;
export declare abstract class Unit extends AlgPart {
}
export declare abstract class Move extends Unit {
}
export declare abstract class Annotation extends Unit {
}
export declare abstract class Container extends Unit {
}
export declare class Sequence extends AlgPart {
    nestedUnits: Unit[];
    type: string;
    constructor(nestedUnits: Unit[]);
}
export interface WithAmount {
    amount: number;
}
export declare class Group extends Container implements WithAmount {
    nestedSequence: Sequence;
    amount: number;
    type: string;
    constructor(nestedSequence: Sequence, amount?: number);
}
export declare class Commutator extends Container implements WithAmount {
    A: Sequence;
    B: Sequence;
    amount: number;
    type: string;
    constructor(A: Sequence, B: Sequence, amount?: number);
}
export declare class Conjugate extends Container implements WithAmount {
    A: Sequence;
    B: Sequence;
    amount: number;
    type: string;
    constructor(A: Sequence, B: Sequence, amount?: number);
}
export declare class Pause extends Move {
    type: string;
    constructor();
}
export declare class NewLine extends Annotation {
    type: string;
    constructor();
}
export declare class CommentShort extends Annotation {
    comment: string;
    type: string;
    constructor(comment: string);
}
export declare class CommentLong extends Annotation {
    comment: string;
    type: string;
    constructor(comment: string);
}
//# sourceMappingURL=alg-part.d.ts.map