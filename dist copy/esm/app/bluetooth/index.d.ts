import "babel-polyfill";
import { BluetoothPuzzle } from "../../src/bluetooth/index";
declare global {
    interface Window {
        puzzle: BluetoothPuzzle | null;
    }
}
//# sourceMappingURL=index.d.ts.map