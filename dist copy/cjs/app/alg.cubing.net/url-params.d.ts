import { Sequence } from "../../src/alg";
export interface PartialURLParamValues {
    alg?: Sequence;
    puzzle?: string;
    "debug-js"?: boolean;
}
export declare type ParamName = keyof typeof paramDefaults;
interface CompleteURLParamValues extends PartialURLParamValues {
    alg: Sequence;
    puzzle: string;
    "debug-js": boolean;
}
declare const paramDefaults: CompleteURLParamValues;
export declare function getURLParam<K extends ParamName>(paramName: K): CompleteURLParamValues[K];
export declare function setURLParams(newParams: PartialURLParamValues): void;
export {};
//# sourceMappingURL=url-params.d.ts.map