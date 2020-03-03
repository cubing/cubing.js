import { BlockMove, Sequence } from "../alg";
import { KPuzzleDefinition, Transformation } from "./definition_types";
export declare function Combine(def: KPuzzleDefinition, t1: Transformation, t2: Transformation): Transformation;
export declare function Multiply(def: KPuzzleDefinition, t: Transformation, amount: number): Transformation;
export declare function IdentityTransformation(definition: KPuzzleDefinition): Transformation;
export declare function Invert(def: KPuzzleDefinition, t: Transformation): Transformation;
export declare function Order(def: KPuzzleDefinition, t: Transformation): number;
export declare function EquivalentTransformations(def: KPuzzleDefinition, t1: Transformation, t2: Transformation): boolean;
export declare function EquivalentStates(def: KPuzzleDefinition, t1: Transformation, t2: Transformation): boolean;
export declare function stateForBlockMove(def: KPuzzleDefinition, blockMove: BlockMove): Transformation;
export declare class KPuzzle {
    definition: KPuzzleDefinition;
    state: Transformation;
    constructor(definition: KPuzzleDefinition);
    serialize(): string;
    applyBlockMove(blockMove: BlockMove): void;
    applyAlg(a: Sequence): void;
    applyMove(moveName: string): this;
    getMoveExpander(create: boolean): MoveExpander | undefined;
    setFaceNames(faceNames: string[]): void;
    addGrip(grip1: string, grip2: string, nslices: number): void;
    expandSlices(rep: string, blockMove: BlockMove): Transformation | undefined;
    expandSlicesByName(mv: string): Transformation | undefined;
    unswizzle(grip: string): string;
}
export declare class MoveExpander {
    private gripStash;
    private moveStash;
    private facenames?;
    private regrip;
    constructor();
    setFaceNames(fn: string[]): void;
    addGrip(grip1: string, grip2: string, nslices: number, def: KPuzzleDefinition): void;
    expandSlicesByName(mv: string, def: KPuzzleDefinition): Transformation | undefined;
    unswizzle(grip: string): string;
    expandSlices(rep: string, blockMove: BlockMove, def: KPuzzleDefinition): Transformation | undefined;
    private splitByFaceNames;
}
//# sourceMappingURL=kpuzzle.d.ts.map