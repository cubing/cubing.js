import { Group } from "three";
import { VRInput } from "./vr-input";
export declare class VRPG3D {
    private vrInput;
    group: Group;
    private twisty;
    private cachedPG3D;
    private resizeInitialDistance;
    private resizeInitialScale;
    private moveInitialPuzzleQuaternion;
    private moveInitialControllerQuaternion;
    private moveLastControllerPosition;
    private moveVelocity;
    private waitForMoveButtonClear;
    constructor(vrInput: VRInput);
    update(): void;
    private setScale;
    private controllerDistance;
    private hapticPulse;
    private onResizeStart;
    private onResizeContinued;
    private onResizeEnd;
    private moveButtonClear;
    private onMoveStart;
    private onMoveContinued;
}
//# sourceMappingURL=vr-pg3d.d.ts.map