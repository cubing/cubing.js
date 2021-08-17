import type { ViewerLinkPage } from "../../../TwistyPlayerConfig";
import { SimpleTwistyPropSource } from "../TwistyProp";

export type ViewerLinkPageWithAuto = ViewerLinkPage | "auto";

export class ViewerLinkProp extends SimpleTwistyPropSource<ViewerLinkPageWithAuto> {
  getDefaultValue(): ViewerLinkPageWithAuto {
    return "auto";
  }
}
