import type { AppendCancelOptions } from "../../../../../alg/index.ts";
import { SimpleTwistyPropSource } from "../../TwistyProp.ts";

// TODO: this should probably be dynamic based on the input, e.g. possibly even controlled using a modifier key.
export class MovePressCancelOptions extends SimpleTwistyPropSource<AppendCancelOptions> {
  getDefaultValue(): AppendCancelOptions {
    return {};
  }
}
