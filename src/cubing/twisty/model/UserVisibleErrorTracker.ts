import { arrayEquals } from "./helpers";
import type { AlgWithIssues } from "./props/puzzle/state/AlgProp";
import { SimpleTwistyPropSource } from "./props/TwistyProp";

interface UserVisibleError {
  puzzleError: string | null;
  algError: string | null;
}

const EMPTY_ERRORS: UserVisibleError = { puzzleError: null, algError: null };

export class UserVisibleErrorTracker extends SimpleTwistyPropSource<UserVisibleError> {
  override getDefaultValue(): UserVisibleError {
    return EMPTY_ERRORS;
  }

  reset() {
    this.set(this.getDefaultValue());
  }

  canReuseValue(_v1: UserVisibleError, _v2: UserVisibleError): boolean {
    return _v1.puzzleError === _v2.puzzleError && _v1.algError === _v2.algError;
  }

  setAlgWithIssues(algWithIssues: AlgWithIssues): AlgWithIssues {
    if (algWithIssues.issues.errors.length > 0) {
      this.set({
        errors: algWithIssues.issues.errors as string[], // TODO
      });
    } else {
      this.reset();
    }
    return algWithIssues;
  }
}
