// TODO: implement URL listener.

import { Alg } from "../../../cubing/alg";
import { legacyPuzzleNameMapping } from "../../../cubing/puzzle-geometry/cubing-private";

export interface PartialURLParamValues {
  alg?: Alg;
  puzzle?: string;
  puzzlegeometry?: string;
  "puzzle-description"?: string;
  "debug-show-render-stats"?: boolean;
  tempo?: string;
}
export type ParamName = keyof typeof paramDefaults;

interface CompleteURLParamValues extends PartialURLParamValues {
  alg: Alg;
  puzzle: string;
  puzzlegeometry?: string;
  "puzzle-description": string;
  "debug-show-render-stats"?: boolean;
  tempo?: string;
}

const paramDefaults: CompleteURLParamValues = {
  alg: new Alg(),
  puzzle: "",
  puzzlegeometry: "",
  "puzzle-description": "",
  "debug-show-render-stats": false,
  tempo: "1",
};

// TODO: Encapsulate and deduplicate this.
const paramDefaultStrings: { [s: string]: string } = {
  alg: "",
  puzzle: "", // TODO: puzzle-name?
  puzzlegeometry: "",
  "puzzle-description": "",
  "debug-show-render-stats": "",
  tempo: "1",
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
      return Alg.fromString(str) as CompleteURLParamValues[K];
    case "puzzle":
    case "puzzlegeometry":
    case "puzzle-description":
      // TODO: can we avoid the `as` cast?
      return str as CompleteURLParamValues[K];
    case "debug-show-render-stats":
      // TODO: can we avoid the `as` cast?
      return (str === "true") as CompleteURLParamValues[K];
    case "tempo":
      return str as CompleteURLParamValues[K];
    default:
      // TODO: can we avoid the `as` cast?
      return str as CompleteURLParamValues[K];
  }
}

// TODO
export function setAlgParam(key: ParamName, s: string): void {
  if (!algParamEnabled) {
    return;
  }
  const url = new URL(window.location.href);
  const params = url.searchParams;
  if (s === "") {
    params.delete(key);
  } else {
    params.set(key, s);
  }
  window.history.replaceState("", "", url.toString());
}

let algParamEnabled: boolean = true;
export function setAlgParamEnabled(enabled: boolean) {
  algParamEnabled = enabled;
  if (!algParamEnabled) {
    const url = new URL(window.location.href);
    const params = url.searchParams;
    params.delete("alg");
    window.history.replaceState("", "", url.toString());
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
      case "alg": {
        if (algParamEnabled) {
          setParam(key, value.toString());
        }
        setAlgParamEnabled;
        break;
      }
      case "puzzle":
      case "puzzlegeometry":
      case "puzzle-description": {
        setParam(key, value);
        break;
      }
      case "debug-show-render-stats": {
        setParam(key, value ? "true" : "");
        break;
      }
      case "tempo": {
        setParam(key, value);
        break;
      }
      default:
        console.warn("Unknown param", key, value);
    }
  }
  window.history.replaceState("", "", url.toString());
}

const remappedPuzzleName = legacyPuzzleNameMapping[getURLParam("puzzle")];
if (remappedPuzzleName) {
  setURLParams({ puzzle: remappedPuzzleName });
}
