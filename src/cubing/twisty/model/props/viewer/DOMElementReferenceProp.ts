import { SimpleTwistyPropSource } from "../TwistyProp";

export class DOMElementReferenceProp extends SimpleTwistyPropSource<Element | null> {
  getDefaultValue(): Element | null {
    return null;
  }
}
