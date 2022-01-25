import { SimpleTwistyPropSource } from "../TwistyProp";

export class ArbitraryStringProp extends SimpleTwistyPropSource<string | null> {
  getDefaultValue(): string | null {
    return null;
  }
}
