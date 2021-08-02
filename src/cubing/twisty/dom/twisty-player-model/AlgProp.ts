import { Alg } from "../../../alg";

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
}

export class AlgProp extends EventTarget {
  #alg: Alg = new Alg();
  #cachedAlgIssues: AlgIssues | null = null;

  set alg(newAlg: Alg) {
    // if (!this.#alg.isIdentical(newAlg)) { // TODO: is this the right way?
    this.#alg = newAlg;
    this.#cachedAlgIssues = null;
    this.dispatchEvent(new CustomEvent("update"));
    // }
  }

  setFromString(newAlgString: string) {
    // console.log("fromstring!");
    try {
      this.alg = new Alg(newAlgString); // TODO: is this safe?
      if (this.#alg.toString() !== newAlgString) {
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
    return (this.#cachedAlgIssues ||= new AlgIssues());
  }
}
