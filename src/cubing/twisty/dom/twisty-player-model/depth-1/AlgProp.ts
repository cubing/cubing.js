import { Alg } from "../../../../alg";

export class AlgIssues {
  // TODO: (string | Error)[]
  warnings: string[] = [];
  errors: string[] = [];

  clone() {
    const newAlgIssues = new AlgIssues();
    newAlgIssues.warnings = this.warnings.slice();
    newAlgIssues.errors = this.errors.slice();
    // console.log("clone");
    return newAlgIssues;
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

export class AlgProp extends EventTarget {
  #alg: Alg = new Alg();
  #cachedAlgIssues: AlgIssues | null = null;

  #setAlgInternal(newAlg: Alg): void {
    this.#alg = newAlg;
    this.#cachedAlgIssues = null;
    this.dispatchEvent(new CustomEvent("update"));
  }

  set alg(newAlg: Alg | string) {
    if (typeof newAlg === "string") {
      this.setFromString(newAlg);
    } else {
      this.#setAlgInternal(newAlg);
    }
  }

  setFromString(newAlgString: string) {
    console.log("fromstring!");
    try {
      this.alg = new Alg(newAlgString); // TODO: is this safe?
      if (this.#alg.toString() !== newAlgString) {
        // TODO: Push this check into the parser and return semantic info (so they can be e.g. highlighted).
        this.#cachedAlgIssues = new AlgIssues();
        this.#cachedAlgIssues.warnings.push(`Alg is non-canonical!`);
      }
    } catch (e) {
      // console.log("catch");
      this.#alg = new Alg(); // TODO
      this.#cachedAlgIssues = new AlgIssues();
      this.#cachedAlgIssues.errors.push(`Malformed alg: ${e}`);
    }
  }

  get alg(): Alg {
    return this.#alg;
  }

  get algIssues(): AlgIssues {
    return (this.#cachedAlgIssues ??= new AlgIssues());
  }
}
