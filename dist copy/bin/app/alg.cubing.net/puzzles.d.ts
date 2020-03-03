import { KPuzzleDefinition } from "../../src/kpuzzle";
import { StickerDat } from "../../src/puzzle-geometry";
import { PuzzleName } from "../../src/puzzle-geometry/Puzzles";
declare class DisplayableKPuzzle {
    private displayNameStr;
    private kpuzzleName;
    type: "kpuzzle";
    constructor(displayNameStr: string, kpuzzleName: string);
    displayName(): string;
    puzzleName(): string;
    kpuzzleDefinition(): KPuzzleDefinition;
}
declare class DisplayablePG3D {
    private displayNameStr;
    private pg3dName;
    type: "pg3d";
    constructor(displayNameStr: string, pg3dName: PuzzleName);
    displayName(): string;
    puzzleName(): string;
    kpuzzleDefinition(): KPuzzleDefinition;
    stickerDat(): StickerDat;
}
export declare type DisplayablePuzzle = DisplayableKPuzzle | DisplayablePG3D;
declare const puzzles: {
    [s: string]: DisplayablePuzzle;
};
export { puzzles };
//# sourceMappingURL=puzzles.d.ts.map