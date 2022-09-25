import type { AppendCancelOptions } from "../../../../../alg";
import { SimpleTwistyPropSource } from "../../TwistyProp";

// TODO: this should probably be dynamic based on the input, e.g. possibly even controlled using a modifier key.
export class MovePressCancelOptions extends SimpleTwistyPropSource<AppendCancelOptions> {
  getDefaultValue(): AppendCancelOptions {
    return {};
  }
}
