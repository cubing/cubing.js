import { SimpleTwistyPropSource } from "../../TwistyProp";

export type FaceletScale = "auto" | number;
export class FaceletScaleProp extends SimpleTwistyPropSource<FaceletScale> {
  getDefaultValue(): FaceletScale {
    return "auto";
  }
}
