import { Scene } from "three";
import { VRInput as VRInput } from "./vr-input";
import { VRPuzzle } from "./vr-puzzle";
export declare class Room {
    private vrInput;
    private vrPuzzle;
    scene: Scene;
    private box;
    constructor(vrInput: VRInput, vrPuzzle: VRPuzzle);
    update(): void;
}
//# sourceMappingURL=room.d.ts.map