import { deserializeURLParam, Sequence, serializeURLParam } from "../../src/alg";

// TODO: implement URL listener.

export interface PartialURLParamValues {
  alg?: Sequence;
  puzzle?: string;
  "debug-js"?: boolean;
}
export type ParamName = keyof typeof paramDefaults;

interface CompleteURLParamValues extends PartialURLParamValues {
  alg: Sequence;
  puzzle: string;
  "debug-js": boolean;
}

const paramDefaults: CompleteURLParamValues = {
  "alg": new Sequence([]),
  "puzzle": "3x3x3",
  "debug-js": true,
};

// TODO: Encapsulate and deduplicate this.
const paramDefaultStrings: { [s: string]: string } = {
  "alg": "",
  "puzzle": "3x3x3",
  "debug-js": "true",
};

export function getURLParam<K extends ParamName>(paramName: K): CompleteURLParamValues[K] {
  const str: string | null = new URLSearchParams(window.location.search).get(paramName);
  if (!str) {
    return paramDefaults[paramName];
  }
  switch (paramName) {
    case "alg":
      // TODO: can we avoid the `as` cast?
      return deserializeURLParam(str) as CompleteURLParamValues[K];
    case "puzzle":
      // TODO: can we avoid the `as` cast?
      return str as CompleteURLParamValues[K];
    case "debug-js":
      // TODO: can we avoid the `as` cast?
      return (str !== "false" as unknown) as CompleteURLParamValues[K];
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
        setParam(key, serializeURLParam(value));
        break;
      case "puzzle":
        setParam(key, value);
        break;
      case "debug-js":
        setParam(key, value.toString());
        break;
      default:
        console.warn("Unknown param", key, value);
    }
  }
  window.history.replaceState("", "", url.toString());
}
