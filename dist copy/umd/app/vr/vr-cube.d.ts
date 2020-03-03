import { Group } from "three";
import { VRInput } from "./vr-input";
export declare class VRCube {
    private vrInput;
    group: Group;
    private twisty;
    private cachedCube3D;
    private controlPlanes;
    private lastAngle;
    private resizeInitialDistance;
    private resizeInitialScale;
    private moveInitialPuzzleQuaternion;
    private moveInitialControllerQuaternion;
    private moveLastControllerPosition;
    private moveVelocity;
    private waitForMoveButtonClear;
    constructor(vrInput: VRInput);
    update(): void;
    private yAngle;
    private gripStart;
    private gripContinued;
    private setScale;
    private controllerDistance;
    private hapticPulse;
    private onResizeStart;
    private onResizeContinued;
    private onResizeEnd;
    private moveButtonClear;
    private onMoveStart;
    private onMoveContinued;
    private onPress;
    private onProxyEvent;
}
//# sourceMappingURL=vr-cube.d.ts.map