import { algToString, parseAlg, Sequence } from "../../cubing/alg";

// TODO: implement URL listener.

export interface PartialURLParamValues {
  alg?: Sequence;
  puzzle?: string;
  puzzlegeometry?: string;
  debugShowRenderStats?: boolean;
}
export type ParamName = keyof typeof paramDefaults;

interface CompleteURLParamValues extends PartialURLParamValues {
  alg: Sequence;
  puzzle: string;
  puzzlegeometry?: string;
  debugShowRenderStats?: boolean;
}

const paramDefaults: CompleteURLParamValues = {
  alg: new Sequence([]),
  puzzle: "",
  puzzlegeometry: "",
  debugShowRenderStats: false,
};

// TODO: Encapsulate and deduplicate this.
const paramDefaultStrings: { [s: string]: string } = {
  alg: "",
  puzzle: "",
  puzzlegeometry: "",
  debugShowRenderStats: "",
};

export function getURLParam<K extends ParamName>(
  paramName: K,
): CompleteURLParamValues[K] {
  const str: string | null = new URLSearchParams(window.location.search).get(
    paramName,
  );
  if (!str) {
    return paramDefaults[paramName];
  }
  switch (paramName) {
    case "alg":
      // TODO: can we avoid the `as` cast?
      return parseAlg(str) as CompleteURLParamValues[K];
    case "puzzle":
    case "puzzlegeometry":
      // TODO: can we avoid the `as` cast?
      return str as CompleteURLParamValues[K];
    case "debugShowRenderStats":
      // TODO: can we avoid the `as` cast?
      return (str === "true") as CompleteURLParamValues[K];
    default:
      // TODO: can we avoid the `as` cast?
      return str as CompleteURLParamValues[K];
  }
}

export function setURLParams(newParams: PartialURLParamValues): void {
  const url = new URL(window.location.href);
  const params = url.searchParams;
  function setParam(key: ParamName, s: string): void {
    if (s === paramDefaultStrings[key]) {
      params.delete(key);
    } else {
      params.set(key, s);
    }
  }

  for (const [key, value] of Object.entries(newParams)) {
    switch (key) {
      case "alg":
        setParam(key, algToString(value));
        break;
      case "puzzle":
      case "puzzlegeometry":
        setParam(key, value);
        break;
      case "debugShowRenderStats":
        setParam(key, value ? "true" : "");
        break;
      default:
        console.warn("Unknown param", key, value);
    }
  }
  window.history.replaceState("", "", url.toString());
}
