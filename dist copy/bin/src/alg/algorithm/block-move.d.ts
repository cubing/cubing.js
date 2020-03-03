import { Move } from "./alg-part";
export declare type MoveFamily = string;
export declare class BlockMove extends Move {
    family: MoveFamily;
    amount: number;
    type: string;
    outerLayer?: number;
    innerLayer?: number;
    constructor(outerLayer: number | undefined, innerLayer: number | undefined, family: MoveFamily, amount?: number);
}
export declare function BareBlockMove(family: MoveFamily, amount?: number): BlockMove;
export declare function LayerBlockMove(innerLayer: number, family: MoveFamily, amount?: number): BlockMove;
export declare function RangeBlockMove(outerLayer: number, innerLayer: number, family: MoveFamily, amount?: number): BlockMove;
//# sourceMappingURL=block-move.d.ts.map