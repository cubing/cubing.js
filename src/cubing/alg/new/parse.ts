import { Alg } from "./Alg";
import { AlgBuilder } from "./AlgBuilder";
import { Bunch } from "./Bunch";
import { Commutator } from "./Commutator";
import { Conjugate } from "./Conjugate";
import { Move, MoveQuantum } from "./Move";
import { Newline } from "./Newline";
import { Pause } from "./Pause";
import { RepetitionInfo } from "./Repetition";

type StoppingChar = "," | ":" | "]" | ")";

function parseIntWithEmptyFallback<T>(n: string, emptyFallback: T): number | T {
  return n ? parseInt(n) : emptyFallback;
}

const repetitionRegex = /^(\d+)?('?)/;
const moveStartRegex = /^[_\dA-Za-z]/;
const moveRegex = /^((([1-9]\d*)-)?([1-9]\d*))?([_A-Za-z])?/;

export function parseAlg(s: string): Alg {
  return new ParsedAlg(s).alg;
}

// TODO: support recording string locations for moves.
class ParsedAlg {
  #idx: number = 0;
  readonly alg: Alg;

  constructor(public readonly input: string) {
    this.alg = this.parseAlgWithStopping([]);
    if (this.#idx !== this.input.length) {
      throw new Error("parsing unexpectedly ended early");
    }
  }

  parseAlgWithStopping(stopBefore: StoppingChar[]): Alg {
    const algBuilder = new AlgBuilder();

    // We're "crowded" if there was not a space or newline since the last unit.
    let crowded = false;

    const mustNotBeCrowded = (): void => {
      if (crowded) {
        throw new Error(
          `Unexpected unit at idx ${this.#idx}. Are you missing a space?`,
        ); // TODO better error message
      }
    };

    mainLoop: while (this.#idx < this.input.length) {
      if ((stopBefore as string[]).includes(this.input[this.#idx])) {
        return algBuilder.toAlg();
      }
      if (this.tryConsumeNext(" ")) {
        crowded = false;
        continue mainLoop;
      } else if (moveStartRegex.test(this.input[this.#idx])) {
        mustNotBeCrowded();
        const move = this.parseMove();
        algBuilder.push(move);
        crowded = true;
        continue mainLoop;
      } else if (this.tryConsumeNext("(")) {
        mustNotBeCrowded();
        const alg = this.parseAlgWithStopping([")"]);
        this.mustConsumeNext(")");
        const repetitionInfo = this.parseRepetition();
        algBuilder.push(new Bunch(alg, repetitionInfo));
        crowded = true;
        continue mainLoop;
      } else if (this.tryConsumeNext("[")) {
        mustNotBeCrowded();
        const A = this.parseAlgWithStopping([",", ":"]);
        const separator = this.popNext();
        const B = this.parseAlgWithStopping(["]"]);
        this.mustConsumeNext("]");
        const repetitionInfo = this.parseRepetition();
        switch (separator) {
          case ":":
            algBuilder.push(new Conjugate(A, B, repetitionInfo));
            crowded = true;
            continue mainLoop;
          case ",":
            algBuilder.push(new Commutator(A, B, repetitionInfo));
            crowded = true;
            continue mainLoop;
          default:
            throw "unexpected parsing error";
        }
      } else if (this.tryConsumeNext("\n")) {
        algBuilder.push(new Newline());
        crowded = false;
        continue mainLoop;
      } else if (this.tryConsumeNext(".")) {
        mustNotBeCrowded();
        algBuilder.push(new Pause());
        while (this.tryConsumeNext(".")) {
          algBuilder.push(new Pause());
        }
        crowded = true;
        continue mainLoop;
      } else {
        throw new Error(`Unexpected character: ${this.popNext()}`);
      }
    }

    if (this.#idx !== this.input.length) {
      throw new Error("did not finish parsing?");
    }
    if (stopBefore.length > 0) {
      throw new Error("expected stopping");
    }
    return algBuilder.toAlg();
  }

  parseMove(): Move {
    const [, , , outerLayerStr, innerLayerStr, family] = this.parseRegex(
      moveRegex,
    );
    const repetitionInfo = this.parseRepetition();

    const move = new Move(
      new MoveQuantum(
        family,
        parseIntWithEmptyFallback(innerLayerStr, undefined),
        parseIntWithEmptyFallback(outerLayerStr, undefined),
      ),
      repetitionInfo,
    );
    return move;
  }

  parseRepetition(): RepetitionInfo {
    const [, absAmountStr, primeStr] = this.parseRegex(repetitionRegex);
    return [parseIntWithEmptyFallback(absAmountStr, null), primeStr === "'"];
  }

  parseRegex(regex: RegExp): RegExpExecArray {
    const arr = regex.exec(this.remaining());
    if (arr === null) {
      throw new Error("internal parsing error"); // TODO
    }
    this.#idx += arr[0].length;
    return arr;
  }

  remaining(): string {
    return this.input.slice(this.#idx);
  }

  private popNext(): string {
    const next = this.input[this.#idx];
    this.#idx++;
    return next;
  }

  private tryConsumeNext(expected: string): boolean {
    if (this.input[this.#idx] === expected) {
      this.#idx++;
      return true;
    }
    return false;
  }

  private mustConsumeNext(expected: string): string {
    const next = this.popNext();
    if (next !== expected) {
      throw new Error(
        `expected \`${expected}\` while parsing, encountered ${next}`,
      ); // TODO: be more helpful
    }
    return next;
  }
}
