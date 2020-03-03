import { Sequence } from "./algorithm";
export interface AlgJSON {
    type: string;
    nestedSequence?: AlgJSON;
    nestedUnits?: AlgJSON[];
    innerLayer?: number;
    outerLayer?: number;
    family?: string;
    amount?: number;
    A?: AlgJSON;
    B?: AlgJSON;
    comment?: string;
}
export declare function fromJSON(json: AlgJSON): Sequence;
//# sourceMappingURL=json.d.ts.map