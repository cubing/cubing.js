import { Conjugate } from "./Conjugate";
import { Commutator } from "./Commutator";
import { Alg } from "./Alg";
import { Move, MoveQuantum } from "./Move";
import { RepetitionInfo } from "./Repetition";
import { Unit } from "./Unit";
import { Bunch } from "./Bunch";
import { Newline } from "./Newline";
import { Pause } from "./Pause";

type StoppingChar = "," | ":" | "]" | ")";

function parseOrNull(n: string): number | null {
  return n ? parseInt(n) : null;
}

const repetitionRegex = /^(\d+)?('?)/;

export const moveStartRegex = /^[_\dA-Za-z]/;
export const moveRegex = /^((([1-9]\d*)-)?([1-9]\d*))?([_A-Za-z])?/;

export function parseAlg(s: string): Alg {
  return new ParsedAlg(s).alg;
}

class ParsedAlg {
  idx: number = 0;
  alg: Alg;

  constructor(public readonly input: string) {
    this.alg = this.parseAlgWithStopping([]);
    if (this.idx !== this.input.length) {
      throw new Error("parsing unexpectedly ended early");
    }
  }

  parseAlgWithStopping(stopBefore: StoppingChar[]): Alg {
    // TODO: Implement an alg builder.
    // console.log(s, idx, stopBefore);
    const units: Unit[] = [];
    let readyForMove = true;
    while (this.idx < this.input.length) {
      if ((stopBefore as string[]).includes(this.input[this.idx])) {
        // console.log(Alg);
        const alg = new Alg(units);
        // console.log(alg);
        return alg;
      }
      if (this.tryConsumeNext("(")) {
        this;
        const alg = this.parseAlgWithStopping([")"]);
        this.idx++;
        const repetitionInfo = this.parseRepetition();
        units.push(new Bunch(alg, repetitionInfo));
      } else if (this.tryConsumeNext("[")) {
        const A = this.parseAlgWithStopping([",", ":"]);
        const separator = this.popNext();
        const B = this.parseAlgWithStopping(["]"]);
        this.mustConsumeNext("]");
        const repetitionInfo = this.parseRepetition();

        // console.log("separator", separator);
        switch (separator) {
          case ":":
            units.push(new Conjugate(A, B, repetitionInfo));
            // console.log(units, A, B);
            readyForMove = false;
            continue;
          case ",":
            units.push(new Commutator(A, B, repetitionInfo));
            // console.log(units, A, B);
            readyForMove = false;
            continue;
          default:
            throw "unexpected parsing error";
        }
      } else if (moveStartRegex.test(this.input[this.idx])) {
        if (!readyForMove) {
          throw new Error(
            `Unexpected move at idx ${this.idx}. Are you missing a space?`,
          ); // TODO better error message
        }
        const move = this.parseMove();
        // console.log(move, move.toString());
        units.push(move);
        readyForMove = false;
        continue;
      } else if (this.tryConsumeNext(" ")) {
        readyForMove = true;
        continue;
      } else if (this.tryConsumeNext("\n")) {
        units.push(new Newline());
        readyForMove = true;
        continue;
      } else if (this.tryConsumeNext(".")) {
        units.push(new Pause());
        while (this.tryConsumeNext(".")) {
          units.push(new Pause());
        }
        readyForMove = true;
        continue;
      } else {
        throw new Error("TODO");
      }
    }

    if (this.idx !== this.input.length) {
      throw new Error("did not finish parsing?");
    }
    if (stopBefore.length > 0) {
      throw new Error("expected stopping");
    }
    // console.log({ units }, units.length, units[0].toString());
    return new Alg(units);
  }

  parseMove(): Move {
    // console.log("parseMove", s, idx);
    const [
      fullMatch,
      ,
      ,
      outerLayerStr,
      innerLayerStr,
      family,
    ] = moveRegex.exec(this.input.slice(this.idx)) as string[]; // TODO: can we be more efficient than `.slice()`?
    this.idx += fullMatch.length;

    const repetitionInfo = this.parseRepetition();

    // console.log(s, idx, repetitionInfo);

    const move = new Move(
      new MoveQuantum(
        family,
        parseOrNull(innerLayerStr) ?? undefined,
        parseOrNull(outerLayerStr) ?? undefined,
      ),
      repetitionInfo,
    );
    return move;
  }

  parseRepetition(): RepetitionInfo {
    const [fullMatch, absAmountStr, primeStr] = repetitionRegex.exec(
      this.input.slice(this.idx),
    ) as string[]; // TODO: can we be more efficient than `.slice()`?
    this.idx += fullMatch.length;

    return [parseOrNull(absAmountStr), primeStr === "'"];
  }

  // private peekNext(): string {
  //   return this.input[this.idx];
  // }

  private popNext(): string {
    const next = this.input[this.idx];
    this.idx++;
    return next;
  }

  private tryConsumeNext(expected: string): boolean {
    if (this.input[this.idx] === expected) {
      this.idx++;
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
