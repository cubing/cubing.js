/// <reference types="jest" />
import { Sequence } from "../algorithm";
declare global {
    namespace jest {
        interface Matchers<R, T> {
            toStructureEqual(observed: Sequence): CustomMatcherResult;
        }
    }
}
export {};
//# sourceMappingURL=structure-equals.d.ts.map