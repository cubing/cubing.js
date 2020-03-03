import { Sequence } from "../../src/alg";
import { Twisty } from "../../src/twisty";
export interface AppData {
    puzzleName: string;
    alg: Sequence;
}
export declare class App {
    element: Element;
    twisty: Twisty;
    private puzzlePane;
    constructor(element: Element, initialData: AppData);
    private initializeTwisty;
    private setAlg;
    private setPuzzle;
}
//# sourceMappingURL=app.d.ts.map