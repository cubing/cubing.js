import { Group, Object3D } from "three";
import { KPuzzleDefinition } from "../../kpuzzle";
import { Cursor } from "../cursor";
import { Puzzle } from "../puzzle";
import { Twisty3D } from "./twisty3D";
export declare class PG3D extends Twisty3D<Puzzle> {
    private definition;
    private group;
    private stickers;
    private axesInfo;
    private stickerTargets;
    private controlTargets;
    constructor(definition: KPuzzleDefinition, pgdat: any, showFoundation?: boolean);
    experimentalGetStickerTargets(): Object3D[];
    experimentalGetControlTargets(): Object3D[];
    experimentalGetGroup(): Group;
    protected updateScene(p: Cursor.Position<Puzzle>): void;
    private ease;
}
//# sourceMappingURL=pg3D.d.ts.map