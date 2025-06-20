import { Alg } from "./Alg";
import { AlgBuilder } from "./AlgBuilder";
import type { AlgNode } from "./alg-nodes";
import { Commutator } from "./alg-nodes/containers/Commutator";
import { Conjugate } from "./alg-nodes/containers/Conjugate";
import { Grouping } from "./alg-nodes/containers/Grouping";
import { LineComment } from "./alg-nodes/leaves/LineComment";
import { Move, QuantumMove } from "./alg-nodes/leaves/Move";
import { Newline } from "./alg-nodes/leaves/Newline";
import { Pause } from "./alg-nodes/leaves/Pause";
import { algDebugGlobals } from "./debug";

type StoppingChar = "," | ":" | "]" | ")";

function parseIntWithEmptyFallback<T>(n: string, emptyFallback: T): number | T {
  return n ? parseInt(n) : emptyFallback;
}

const AMOUNT_REGEX = /^(\d+)?('?)/;
const MOVE_START_REGEX = /^[_\dA-Za-z]/; // TODO: Handle slash
const QUANTUM_MOVE_REGEX = /^((([1-9]\d*)-)?([1-9]\d*))?([_A-Za-z]+)/;
const COMMENT_TEXT_REGEX = /^[^\n]*/;
const SQUARE1_PAIR_START_REGEX = /^(-?\d+), ?/; // TODO: match up with other whitespace handling?
const SQUARE1_PAIR_END_REGEX = /^(-?\d+)\)/; // TODO: match up with other whitespace handling?

export function parseAlg(s: string): Alg {
  return new AlgParser().parseAlg(s);
}

export function parseMove(s: string): Move {
  return new AlgParser().parseMove(s);
}

export function parseQuantumMove(s: string): QuantumMove {
  return new AlgParser().parseQuantumMove(s);
}

export const startCharIndexKey = Symbol("startCharIndex");
export const endCharIndexKey = Symbol("endCharIndex");

export interface ParserIndexed {
  [startCharIndexKey]: number;
  [endCharIndexKey]: number;
}

export type Parsed<T extends Alg | AlgNode> = T & ParserIndexed;

// TODO: attach to parser so the end char index can default to `this.#idx`?
function addCharIndices<T extends Alg | AlgNode>(
  t: T,
  startCharIndex: number,
  endCharIndex: number,
): Parsed<T> {
  const parsedT = t as ParserIndexed & T;
  parsedT[startCharIndexKey] = startCharIndex;
  parsedT[endCharIndexKey] = endCharIndex;
  return parsedT;
}

export function transferCharIndex<T extends Alg | AlgNode>(from: T, to: T): T {
  if (startCharIndexKey in from) {
    (to as Parsed<T>)[startCharIndexKey] = (from as Parsed<T>)[
      startCharIndexKey
    ];
  }
  if (endCharIndexKey in from) {
    (to as Parsed<T>)[endCharIndexKey] = (from as Parsed<T>)[endCharIndexKey];
  }
  return to;
}

type MoveSuffix = "+" | "++" | "-" | "--";

// TODO: support recording string locations for moves.
class AlgParser {
  #input: string = "";
  #idx: number = 0;
  #nissQueue: Grouping[] = [];

  parseAlg(input: string): Parsed<Alg> {
    this.#input = input;
    this.#idx = 0;
    const alg = this.parseAlgWithStopping([]);
    this.mustBeAtEndOfInput();
    const algNodes = Array.from(alg.childAlgNodes());
    if (this.#nissQueue.length > 0) {
      for (const nissGrouping of this.#nissQueue.reverse()) {
        algNodes.push(nissGrouping);
      }
    }
    const newAlg = new Alg(algNodes) as Parsed<Alg>;
    const {
      [startCharIndexKey]: startCharIndex,
      [endCharIndexKey]: endCharIndex,
    } = alg;
    addCharIndices(newAlg, startCharIndex, endCharIndex);
    return newAlg;
  }

  parseMove(input: string): Parsed<Move> {
    this.#input = input;
    this.#idx = 0;
    const move = this.parseMoveImpl();
    this.mustBeAtEndOfInput();
    return move;
  }

  parseQuantumMove(input: string): QuantumMove {
    this.#input = input;
    this.#idx = 0;
    const quantumMove = this.parseQuantumMoveImpl();
    this.mustBeAtEndOfInput();
    return quantumMove;
  }

  private mustBeAtEndOfInput() {
    if (this.#idx !== this.#input.length) {
      throw new Error("parsing unexpectedly ended early");
    }
  }

  private parseAlgWithStopping(stopBefore: StoppingChar[]): Parsed<Alg> {
    let algStartIdx = this.#idx;
    let algEndIdx = this.#idx;
    const algBuilder = new AlgBuilder();

    // We're "crowded" if there was not a space or newline since the last alg node.
    let crowded = false;

    const mustNotBeCrowded = (idx: number): void => {
      if (crowded) {
        throw new Error(
          `Unexpected character at index ${idx}. Are you missing a space?`,
        ); // TODO better error message
      }
    };

    while (this.#idx < this.#input.length) {
      const savedCharIndex = this.#idx;
      if ((stopBefore as string[]).includes(this.#input[this.#idx])) {
        return addCharIndices(algBuilder.toAlg(), algStartIdx, algEndIdx);
      }
      if (this.tryConsumeNext(" ")) {
        crowded = false;
        if (algBuilder.experimentalNumAlgNodes() === 0) {
          algStartIdx = this.#idx;
        }
      } else if (MOVE_START_REGEX.test(this.#input[this.#idx])) {
        mustNotBeCrowded(savedCharIndex);
        const move = this.parseMoveImpl();
        algBuilder.push(move);
        crowded = true;
        algEndIdx = this.#idx;
      } else if (this.tryConsumeNext("(")) {
        mustNotBeCrowded(savedCharIndex);
        const sq1PairStartMatch = this.tryRegex(SQUARE1_PAIR_START_REGEX);
        if (sq1PairStartMatch) {
          const topAmountString = sq1PairStartMatch[1];
          const savedCharIndexD = this.#idx;
          const sq1PairEndMatch = this.parseRegex(SQUARE1_PAIR_END_REGEX);
          const uMove = addCharIndices(
            new Move(new QuantumMove("U_SQ_"), parseInt(topAmountString)),
            savedCharIndex + 1,
            savedCharIndex + 1 + topAmountString.length,
          );
          const dMove = addCharIndices(
            new Move(new QuantumMove("D_SQ_"), parseInt(sq1PairEndMatch[1])),
            savedCharIndexD,
            this.#idx - 1,
          );
          const alg = addCharIndices(
            new Alg([uMove, dMove]),
            savedCharIndex + 1,
            this.#idx - 1,
          );
          algBuilder.push(
            addCharIndices(new Grouping(alg), savedCharIndex, this.#idx),
          );
          crowded = true;
          algEndIdx = this.#idx;
        } else {
          const alg = this.parseAlgWithStopping([")"]);
          this.mustConsumeNext(")");
          const amount = this.parseAmount();
          algBuilder.push(
            addCharIndices(
              new Grouping(alg, amount),
              savedCharIndex,
              this.#idx,
            ),
          );
          crowded = true;
          algEndIdx = this.#idx;
        }
      } else if (this.tryConsumeNext("^")) {
        if (!algDebugGlobals.caretNISSNotationEnabled) {
          throw new Error(
            "Alg contained a caret but caret NISS notation is not enabled.",
          );
        }

        this.mustConsumeNext("(");
        const alg = this.parseAlgWithStopping([")"]);
        this.popNext();

        const grouping = new Grouping(alg, -1);
        const placeholder = new Pause();

        grouping.experimentalNISSPlaceholder = placeholder;
        placeholder.experimentalNISSGrouping = grouping;

        this.#nissQueue.push(grouping);
        algBuilder.push(placeholder);
      } else if (this.tryConsumeNext("[")) {
        mustNotBeCrowded(savedCharIndex);
        const A = this.parseAlgWithStopping([",", ":"]);
        const separator = this.popNext();
        const B = this.parseAlgWithStopping(["]"]);
        this.mustConsumeNext("]");
        let unrepeated: Commutator | Conjugate;
        switch (separator) {
          case ":": {
            unrepeated = addCharIndices(
              new Conjugate(A, B),
              savedCharIndex,
              this.#idx,
            );
            crowded = true;
            algEndIdx = this.#idx;
            break;
          }
          case ",": {
            unrepeated = addCharIndices(
              new Commutator(A, B),
              savedCharIndex,
              this.#idx,
            );
            crowded = true;
            algEndIdx = this.#idx;
            break;
          }
          default:
            throw new Error("unexpected parsing error");
        }
        const afterClosingBracketIdx = this.#idx;
        const amount = this.parseAmount();
        if (amount === 1) {
          algBuilder.push(unrepeated);
        } else {
          const unrepeatedAlg = addCharIndices(
            new Alg([unrepeated]),
            savedCharIndex,
            afterClosingBracketIdx,
          );
          const grouping = addCharIndices(
            new Grouping(unrepeatedAlg, amount),
            savedCharIndex,
            this.#idx,
          );
          algBuilder.push(grouping);
        }
        crowded = true;
        algEndIdx = this.#idx;
      } else if (this.tryConsumeNext("\n")) {
        algBuilder.push(
          addCharIndices(new Newline(), savedCharIndex, this.#idx),
        );
        crowded = false;
        algEndIdx = this.#idx;
      } else if (this.tryConsumeNext("/")) {
        if (this.tryConsumeNext("/")) {
          mustNotBeCrowded(savedCharIndex);
          const [text] = this.parseRegex(COMMENT_TEXT_REGEX);
          algBuilder.push(
            addCharIndices(new LineComment(text), savedCharIndex, this.#idx),
          );
          crowded = false;
          algEndIdx = this.#idx;
        } else {
          // We allow crowding here to account for csTimer scrambles, which don't have a space between a Square-1 tuple and the following slash.
          algBuilder.push(
            addCharIndices(new Move("_SLASH_"), savedCharIndex, this.#idx),
          );
          crowded = true;
          algEndIdx = this.#idx;
        }
      } else if (this.tryConsumeNext(".")) {
        mustNotBeCrowded(savedCharIndex);
        algBuilder.push(addCharIndices(new Pause(), savedCharIndex, this.#idx));
        crowded = true;
        algEndIdx = this.#idx;
      } else {
        throw new Error(`Unexpected character: ${this.popNext()}`);
      }
    }

    if (this.#idx !== this.#input.length) {
      throw new Error("did not finish parsing?");
    }
    if (stopBefore.length > 0) {
      throw new Error("expected stopping");
    }
    return addCharIndices(algBuilder.toAlg(), algStartIdx, algEndIdx);
  }

  private parseQuantumMoveImpl(): QuantumMove {
    const [, , , outerLayerStr, innerLayerStr, family] =
      this.parseRegex(QUANTUM_MOVE_REGEX);

    return new QuantumMove(
      family,
      parseIntWithEmptyFallback(innerLayerStr, undefined),
      parseIntWithEmptyFallback(outerLayerStr, undefined),
    );
  }

  private parseMoveImpl(): Parsed<Move> {
    const savedCharIndex = this.#idx;

    if (this.tryConsumeNext("/")) {
      return addCharIndices(new Move("_SLASH_"), savedCharIndex, this.#idx);
    }

    let quantumMove = this.parseQuantumMoveImpl();
    // Only `hadEmptyAbsAmount` is `const`.
    let [amount, hadEmptyAbsAmount] = this.parseAmountAndTrackEmptyAbsAmount();
    const suffix = this.parseMoveSuffix();

    if (suffix) {
      if (amount < 0) {
        throw new Error("uh-oh");
      }
      if ((suffix === "++" || suffix === "--") && amount !== 1) {
        // TODO: Handle 1 vs. null
        throw new Error(
          "Pochmann ++ or -- moves cannot have an amount other than 1.",
        );
      }
      if ((suffix === "++" || suffix === "--") && !hadEmptyAbsAmount) {
        throw new Error(
          "Pochmann ++ or -- moves cannot have an amount written as a number.",
        );
      }
      if ((suffix === "+" || suffix === "-") && hadEmptyAbsAmount) {
        throw new Error(
          "Clock dial moves must have an amount written as a natural number followed by + or -.",
        );
      }
      if (suffix.startsWith("+")) {
        quantumMove = quantumMove.modified({
          family: `${quantumMove.family}_${
            suffix === "+" ? "PLUS" : "PLUSPLUS"
          }_`, // TODO
        });
      }
      if (suffix.startsWith("-")) {
        quantumMove = quantumMove.modified({
          family: `${quantumMove.family}_${
            suffix === "-" ? "PLUS" : "PLUSPLUS"
          }_`, // TODO
        });
        amount *= -1;
      }
    }

    const move = addCharIndices(
      new Move(quantumMove, amount),
      savedCharIndex,
      this.#idx,
    );
    return move;
  }

  private parseMoveSuffix(): MoveSuffix | null {
    if (this.tryConsumeNext("+")) {
      if (this.tryConsumeNext("+")) {
        return "++";
      }
      return "+";
    }
    if (this.tryConsumeNext("-")) {
      if (this.tryConsumeNext("-")) {
        return "--";
      }
      return "-";
    }
    return null;
  }

  private parseAmountAndTrackEmptyAbsAmount(): [number, boolean] {
    const savedIdx = this.#idx;
    const [, absAmountStr, primeStr] = this.parseRegex(AMOUNT_REGEX);
    if (absAmountStr?.startsWith("0") && absAmountStr !== "0") {
      throw new Error(
        `Error at char index ${savedIdx}: An amount can only start with 0 if it's exactly the digit 0.`,
      );
    }
    return [
      parseIntWithEmptyFallback(absAmountStr, 1) * (primeStr === "'" ? -1 : 1),
      !absAmountStr,
    ];
  }

  private parseAmount(): number {
    const savedIdx = this.#idx;
    const [, absAmountStr, primeStr] = this.parseRegex(AMOUNT_REGEX);
    if (absAmountStr?.startsWith("0") && absAmountStr !== "0") {
      throw new Error(
        `Error at char index ${savedIdx}: An amount number can only start with 0 if it's exactly the digit 0.`,
      );
    }
    return (
      parseIntWithEmptyFallback(absAmountStr, 1) * (primeStr === "'" ? -1 : 1)
    );
  }

  private parseRegex(regex: RegExp): RegExpExecArray {
    const arr = regex.exec(this.remaining());
    if (arr === null) {
      throw new Error("internal parsing error"); // TODO
    }
    this.#idx += arr[0].length;
    return arr;
  }

  // TOD: can we avoid this?
  private tryRegex(regex: RegExp): RegExpExecArray | null {
    const arr = regex.exec(this.remaining());
    if (arr === null) {
      return null;
    }
    this.#idx += arr[0].length;
    return arr;
  }

  private remaining(): string {
    return this.#input.slice(this.#idx);
  }

  private popNext(): string {
    const next = this.#input[this.#idx];
    this.#idx++;
    return next;
  }

  private tryConsumeNext(expected: string): boolean {
    if (this.#input[this.#idx] === expected) {
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
