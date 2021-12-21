import { arrayEquals } from "./helpers";
import { SimpleTwistyPropSource } from "./props/TwistyProp";

interface UserVisibleError {
  errors: string[];
}

const EMPTY_ERRORS = { errors: [] };

export class UserVisibleErrorTracker extends SimpleTwistyPropSource<UserVisibleError> {
  override getDefaultValue(): UserVisibleError {
    return EMPTY_ERRORS;
  }

  reset() {
    this.set(this.getDefaultValue());
  }

  canReuseValue(_v1: UserVisibleError, _v2: UserVisibleError): boolean {
    return arrayEquals(_v1.errors, _v2.errors);
  }
}
