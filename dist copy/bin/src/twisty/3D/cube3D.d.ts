import { Group } from "three";
import { KPuzzleDefinition } from "../../kpuzzle";
import { Cursor } from "../cursor";
import { Puzzle } from "../puzzle";
import { Twisty3D } from "./twisty3D";
interface Cube3DOptions {
    showMainStickers?: boolean;
    showHintStickers?: boolean;
    showFoundation?: boolean;
}
export declare class Cube3D extends Twisty3D<Puzzle> {
    private cube;
    private pieces;
    private options;
    private experimentalHintStickerMeshes;
    private experimentalFoundationMeshes;
    constructor(def: KPuzzleDefinition, options?: Cube3DOptions);
    experimentalGetCube(): Group;
    experimentalUpdateOptions(options: Cube3DOptions): void;
    protected updateScene(p: Cursor.Position<Puzzle>): void;
    private createCubie;
    private createCubieFoundation;
    private createSticker;
    private ease;
}
export {};
//# sourceMappingURL=cube3D.d.ts.map