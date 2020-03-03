import { MoveEvent, OrientationEvent } from "./bluetooth-puzzle";
export interface StreamTransformer {
    transformMove(moveEvent: MoveEvent): void;
    transformOrientation(orientationEvent: OrientationEvent): void;
}
export declare class BasicRotationTransformer implements StreamTransformer {
    transformMove(moveEvent: MoveEvent): void;
    transformOrientation(orientationEvent: OrientationEvent): void;
}
//# sourceMappingURL=transformer.d.ts.map