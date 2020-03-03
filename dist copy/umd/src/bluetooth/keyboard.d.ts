import { KPuzzle } from "../kpuzzle";
import { BluetoothPuzzle, PuzzleState } from "./bluetooth-puzzle";
export declare class KeyboardPuzzle extends BluetoothPuzzle {
    puzzle: KPuzzle;
    constructor(target: any);
    name(): string | undefined;
    getState(): Promise<PuzzleState>;
    private onKeyDown;
}
export declare function debugKeyboardConnect(target?: any): Promise<KeyboardPuzzle>;
//# sourceMappingURL=keyboard.d.ts.map