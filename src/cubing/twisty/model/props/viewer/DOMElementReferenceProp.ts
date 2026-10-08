import { SimpleTwistyPropSource } from "../TwistyProp.ts";

export class DOMElementReferenceProp extends SimpleTwistyPropSource<Element | null> {
  getDefaultValue(): Element | null {
    return null;
  }
}
