import { Sequence } from "./algorithm";
export declare function serializeURLParam(a: Sequence): string;
export declare function deserializeURLParam(a: string): Sequence;
export declare function getAlgURLParam(name: string): Sequence;
export interface AlgCubingNetOptions {
    alg?: Sequence;
    setup?: Sequence;
    title?: string;
    puzzle?: "1x1x1" | "2x2x2" | "3x3x3" | "4x4x4" | "5x5x5" | "6x6x6" | "7x7x7" | "8x8x8" | "9x9x9" | "10x10x10" | "11x11x11" | "12x12x12" | "13x13x13" | "14x14x14" | "16x16x16" | "17x17x17";
    stage?: "full" | "cross" | "F2L" | "LL" | "OLL" | "PLL" | "CLS" | "ELS" | "L6E" | "CMLL" | "WV" | "ZBLL" | "void";
    view?: "editor" | "playback" | "fullscreen";
    type?: "moves" | "reconstruction" | "alg" | "reconstruction-end-with-setup";
}
export declare function algCubingNetLink(options: AlgCubingNetOptions): string;
//# sourceMappingURL=url.d.ts.map