import type { BackViewLayout } from "../../../viewers/TwistyViewerWrapper";
import { SimpleTwistyPropSource } from "../TwistyProp";

export type BackViewLayoutWithAuto = BackViewLayout | "auto";

export class BackViewProp extends SimpleTwistyPropSource<BackViewLayoutWithAuto> {
  getDefaultValue(): BackViewLayoutWithAuto {
    return "auto";
  }
}
