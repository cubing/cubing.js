import type { ViewerLinkPage } from "../../old/dom/TwistyPlayerConfig";
import { SimpleTwistyPropSource } from "../TwistyProp";

export type ViewerLinkPageWithAuto = ViewerLinkPage | "auto";

export class ViewerLinkProp extends SimpleTwistyPropSource<ViewerLinkPageWithAuto> {
  name = "viewer link";

  getDefaultValue(): ViewerLinkPageWithAuto {
    return "auto";
  }
}
