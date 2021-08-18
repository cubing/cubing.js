import { SimpleTwistyPropSource } from "../TwistyProp";

// TODO: Pick a better name. `speed` is probably good, although that could mean
// something else (e.g. shorter, faster moves but still with the same spacing).
export class TempoScaleProp extends SimpleTwistyPropSource<number> {
  getDefaultValue(): number {
    return 1;
  }
}
