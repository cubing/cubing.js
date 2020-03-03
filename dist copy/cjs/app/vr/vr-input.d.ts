import { Group, Vector3, WebGLRenderer } from "three";
export declare enum Status {
    Untargeted = 0,
    Targeted = 1,
    Pressed = 2
}
export declare enum OculusButton {
    Trackpad = 0,
    Trigger = 1,
    Grip = 2,
    XorA = 3,
    YorB = 4
}
export declare const controllerDirection: Vector3;
export declare enum ButtonGrouping {
    All = "all",
    Any = "any",
    Single = "single",
    None = "none"
}
export declare type ButtonListenerCallback = () => void;
export interface ButtonSpec {
    controllerIdx: number;
    buttonIdx: number;
    invert?: boolean;
}
export declare class VRInput {
    controllers: Group[];
    private buttonListeners;
    private previousButtonStates;
    constructor(renderer: WebGLRenderer);
    update(): void;
    addButtonListener(grouping: ButtonGrouping, buttonSpecs: ButtonSpec[], activatedCallback: ButtonListenerCallback, continuedActiveCallback?: ButtonListenerCallback, deactivatedCallback?: ButtonListenerCallback): void;
    addSingleButtonListener(buttonSpec: ButtonSpec, activatedCallback: ButtonListenerCallback, continuedActiveCallback?: ButtonListenerCallback, deactivatedCallback?: ButtonListenerCallback): void;
}
//# sourceMappingURL=vr-input.d.ts.map