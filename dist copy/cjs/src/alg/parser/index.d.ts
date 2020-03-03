import { Sequence } from "../algorithm";
import { Validator } from "../validation";
export interface ParseOptions {
    validators?: Validator[];
}
export declare function parse(s: string, options?: ParseOptions): Sequence;
export declare function parseSiGN(s: string): Sequence;
//# sourceMappingURL=index.d.ts.map