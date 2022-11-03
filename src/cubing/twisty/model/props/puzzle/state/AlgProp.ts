import { Alg } from "../../../../../alg";
import { arrayEquals } from "../../../helpers";
import { TwistyPropSource } from "../../TwistyProp";

export class AlgIssues {
  // TODO: (string | Error)[]

  readonly warnings: readonly string[];
  readonly errors: readonly string[];

  constructor(issues?: { warnings?: string[]; errors?: string[] }) {
    // TODO: clone inputs?
    this.warnings = Object.freeze(issues?.warnings ?? []);
    this.errors = Object.freeze(issues?.errors ?? []);
    Object.freeze(this);
  }

  add(issues?: { warnings?: string[]; errors?: string[] }) {
    return new AlgIssues({
      warnings: this.warnings.concat(issues?.warnings ?? []),
      errors: this.errors.concat(issues?.errors ?? []),
    });
  }

  /** @deprecated */
  log() {
    if (this.errors.length > 0) {
      console.error(`🚨 ${this.errors[0]}`);
    } else if (this.warnings.length > 0) {
      console.warn(`⚠️ ${this.warnings[0]}`);
    } else {
      console.info("😎 No issues!");
    }
  }
}

export interface AlgWithIssues {
  alg: Alg;
  issues: AlgIssues;
}

export function algWithIssuesFromString(s: string): AlgWithIssues {
  try {
    const alg = Alg.fromString(s); // TODO: is this safe?
    const warnings = [];
    if (alg.toString() !== s) {
      // TODO: Push this check into the parser and return semantic info (so they can be e.g. highlighted).
      warnings.push("Alg is non-canonical!");
    }
    return {
      alg,
      issues: new AlgIssues({ warnings }),
    };
  } catch (e) {
    return {
      alg: new Alg(),
      issues: new AlgIssues({
        errors: [`Malformed alg: ${(e as Error).toString()}`],
      }),
    };
  }
}

function algWithIssuesEquals(a1: AlgWithIssues, a2: AlgWithIssues): boolean {
  return (
    a1.alg.isIdentical(a2.alg) &&
    arrayEquals(a1.issues.warnings, a2.issues.warnings) &&
    arrayEquals(a1.issues.errors, a2.issues.errors)
  );
}

export class AlgProp extends TwistyPropSource<AlgWithIssues, Alg | string> {
  override getDefaultValue(): AlgWithIssues {
    return { alg: new Alg(), issues: new AlgIssues() };
  }

  protected override canReuseValue(v1: AlgWithIssues, v2: AlgWithIssues) {
    return algWithIssuesEquals(v1, v2);
  }

  protected override async derive(
    newAlg: Alg | string,
  ): Promise<AlgWithIssues> {
    if (typeof newAlg === "string") {
      return algWithIssuesFromString(newAlg);
    } else {
      return {
        alg: newAlg,
        issues: new AlgIssues(),
      };
    }
  }
}
