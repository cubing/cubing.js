import { MoveExpander } from "./kpuzzle";
export interface OrbitTransformation {
    permutation: number[];
    orientation: number[];
}
export interface Transformation {
    [/* orbit name */ key: string]: OrbitTransformation;
}
export interface OrbitDefinition {
    numPieces: number;
    orientations: number;
}
export interface KPuzzleDefinition {
    name: string;
    orbits: {
        [/* orbit name */ key: string]: OrbitDefinition;
    };
    startPieces: Transformation;
    moves: {
        [/* move name */ key: string]: Transformation;
    };
    svg?: string;
    moveExpander?: MoveExpander;
}
//# sourceMappingURL=definition_types.d.ts.map