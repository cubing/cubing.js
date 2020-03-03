import { BlockMove, Sequence } from "./algorithm";
interface BlockMoveModifications {
    outerLayer?: number;
    innerLayer?: number;
    family?: string;
    amount?: number;
}
export declare function modifiedBlockMove(original: BlockMove, modifications: BlockMoveModifications): BlockMove;
export declare function experimentalAppendBlockMove(s: Sequence, newMove: BlockMove, coalesceLastMove?: boolean, mod?: number): Sequence;
export declare function experimentalConcatAlgs(...args: Sequence[]): Sequence;
export {};
//# sourceMappingURL=operation.d.ts.map