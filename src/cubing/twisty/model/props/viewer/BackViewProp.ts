import { SimpleTwistyPropSource } from "../TwistyProp";

export const backViewLayouts = {
  none: true, // default
  "side-by-side": true,
  "top-right": true,
};
export type BackViewLayout = keyof typeof backViewLayouts;

export type BackViewLayoutWithAuto = BackViewLayout | "auto";

export class BackViewProp extends SimpleTwistyPropSource<BackViewLayoutWithAuto> {
  getDefaultValue(): BackViewLayoutWithAuto {
    return "auto";
  }
}
