import { deserializeURLParam, Sequence, serializeURLParam } from "../../src/alg";
import { Puzzles } from "../../src/kpuzzle";

// TODO: implement URL listener.

type KPuzzleName = keyof typeof Puzzles;

const acnToKPuzzleNameMap: { [s: string]: KPuzzleName } = {
  "3x3x3": "333",
  "2x2x2": "222",
};

// TODO: stricter key type.
const kPuzzleToAcnNameMap: { [s: string]: string } = {};
for (const [key, value] of Object.entries(acnToKPuzzleNameMap)) {
  kPuzzleToAcnNameMap[value] = key;
}

export interface PartialURLParamValues {
  alg?: Sequence;
  puzzle?: KPuzzleName;
}
export type ParamName = keyof typeof paramDefaultStrings;

interface CompleteURLParamValues extends PartialURLParamValues {
  alg: Sequence;
  puzzle: string;
}

const paramDefaultStrings: CompleteURLParamValues = {
  alg: new Sequence([]),
  puzzle: "333",
};

export function getURLParam<K extends ParamName>(paramName: K): CompleteURLParamValues[K] {
  const str: string | null = new URLSearchParams(window.location.search).get(paramName);
  if (!str) {
    return paramDefaultStrings[paramName];
  }
  switch (paramName) {
    case "alg":
      // TODO: can we avoid the `as` cast?
      return deserializeURLParam(str) as CompleteURLParamValues[K];
    case "puzzle":
      // TODO: can we avoid the `as` cast?
      return (acnToKPuzzleNameMap[str] ?? str) as CompleteURLParamValues[K];
    default:
      // TODO: can we avoid the `as` cast?
      return str as CompleteURLParamValues[K];
  }
}

export function setURLParams(newParams: PartialURLParamValues): void {
  const url = new URL(window.location.href);
  const params = url.searchParams;
  for (const [key, value] of Object.entries(newParams)) {
    switch (key) {
      case "alg":
        params.set(key, serializeURLParam(value));
        break;
      case "puzzle":
        params.set(key, (kPuzzleToAcnNameMap[value] ?? value));
        break;
      default:
        params.set(key, value);
    }
  }
  window.history.replaceState("", "", url.toString());
}
