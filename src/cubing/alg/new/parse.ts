import { Conjugate } from "./Conjugate";
import { Commutator } from "./Commutator";
import { Alg } from "./Alg";
import { Move, MoveQuantum } from "./Move";
import { RepetitionInfo } from "./Repetition";
import { Unit } from "./Unit";

type StoppingChar = "," | ":" | "]" | ")";

function parseOrNull(n: string): number | null {
  return n ? parseInt(n) : null;
}

const repetitionRegex = /^(\d+)?'?/;
function parseRepetition(s: string, idx: number): [RepetitionInfo, number] {
  const [fullMatch, absAmountStr, primeStr] = repetitionRegex.exec(
    s.slice(idx),
  ) as string[]; // TODO: can we be more efficient than `.slice()`?
  idx += fullMatch.length;

  return [[parseOrNull(absAmountStr), primeStr === "'"], idx];
}

export const moveRegex = /^((([1-9]\d*)-)?([1-9]\d*))?([_A-Za-z])?/;

function parseMove(s: string, idx: number): [Move, number] {
  const [fullMatch, , , outerLayerStr, innerLayerStr, family] = moveRegex.exec(
    s.slice(idx),
  ) as string[]; // TODO: can we be more efficient than `.slice()`?
  idx += fullMatch.length;

  let repetitionInfo: RepetitionInfo;
  [repetitionInfo, idx] = parseRepetition(s, idx);

  const move = new Move(
    new MoveQuantum(
      family,
      parseOrNull(innerLayerStr) ?? undefined,
      parseOrNull(outerLayerStr) ?? undefined,
    ),
    repetitionInfo,
  );
  return [move, idx];
}

function parseAlgWithStopping(
  s: string,
  idx: number,
  stopBefore: StoppingChar[],
): [Alg, number] {
  const units: Unit[] = [];
  let readyForMove = true;
  while (idx < s.length) {
    if ((stopBefore as string[]).includes(s[idx])) {
      return [new Alg(), idx];
    }
    if (s[idx] === "[") {
      let A: Alg;
      [A, idx] = parseAlgWithStopping(s, idx + 1, [",", ":"]);
      const separator = s[idx]; // TODO: hit end??
      idx++;
      let B: Alg;
      [B, idx] = parseAlgWithStopping(s, idx, ["]"]);
      idx++;
      let repetitionInfo: RepetitionInfo;
      [repetitionInfo, idx] = parseRepetition(s, idx);

      switch (separator) {
        case ":":
          units.push(new Conjugate(A, B, repetitionInfo));
          console.log(units, A, B);
          readyForMove = false;
          continue;
        case ",":
          units.push(new Commutator(A, B, repetitionInfo));
          console.log(units, A, B);
          readyForMove = false;
          continue;
        default:
          throw "unexpected parsing error";
      }
    } else if (/^[_\dA-Za-z]/.test(s[idx])) {
      if (!readyForMove) {
        throw new Error(
          `Unexpected move at idx ${idx}. Are you missing a space?`,
        ); // TODO better error message
      }
      let move: Move;
      [move, idx] = parseMove(s, idx);
      console.log(move, move.toString());
      units.push(move);
      readyForMove = false;
      continue;
    } else if (s[idx] === " ") {
      idx++;
      readyForMove = true;
      continue;
    } else {
      throw new Error("TODO");
    }
  }

  if (idx !== s.length) {
    throw new Error("did not finish parsing?");
  }
  console.log({ units }, units.length);
  return [new Alg(units), idx];
}

export function parseAlg(s: string): Alg {
  const [alg, idx] = parseAlgWithStopping(s, 0, []);
  if (idx !== s.length) {
    throw new Error("parsing unexpectedly ended early");
  }
  return alg;
}
