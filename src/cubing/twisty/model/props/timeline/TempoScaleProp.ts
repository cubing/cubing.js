import { TwistyPropSource } from "../TwistyProp";

// TODO: Pick a better name. `speed` is probably good, although that could mean
// something else (e.g. shorter, faster moves but still with the same spacing).
export class TempoScaleProp extends TwistyPropSource<number, number> {
  getDefaultValue(): number {
    return 1;
  }

  derive(v: number): number {
    return v < 0 ? 1 : v;
  }
}
