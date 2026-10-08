import { SimpleTwistyPropSource } from "../TwistyProp.ts";

export class ArbitraryStringProp extends SimpleTwistyPropSource<string | null> {
  getDefaultValue(): string | null {
    return null;
  }
}
