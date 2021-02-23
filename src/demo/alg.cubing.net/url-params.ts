// TODO: implement URL listener.

import { Alg } from "../../cubing/alg";

interface URLParamValues {
  "experimental-setup-alg": Alg;
  "alg": Alg;
  "puzzle": string;
  "debug-js": boolean;
  "debug-simultaneous": boolean;
}

const paramDefaults: URLParamValues = {
  "experimental-setup-alg": new Alg(),
  "alg": new Alg(),
  "puzzle": "3x3x3",
  "debug-js": true,
  "debug-simultaneous": false,
};

export type ParamName = keyof typeof paramDefaults;

// TODO: Encapsulate and deduplicate this.
const paramDefaultStrings: { [s: string]: string } = {
  "experimental-setup-alg": "",
  "alg": "",
  "puzzle": "3x3x3",
  "debug-js": "true",
  "debug-simultaneous": "false",
};

export function getURLParam<K extends ParamName>(
  paramName: K,
): URLParamValues[K] {
  const str: string | null = new URLSearchParams(window.location.search).get(
    paramName,
  );
  if (!str) {
    return paramDefaults[paramName];
  }
  switch (paramName) {
    case "alg":
      // TODO: can we avoid the `as` cast?
      return Alg.fromString(str) as URLParamValues[K];
    case "experimental-setup-alg":
      // TODO: can we avoid the `as` cast?
      return Alg.fromString(str) as URLParamValues[K];
    case "puzzle":
      // TODO: can we avoid the `as` cast?
      return str as URLParamValues[K];
    case "debug-js":
      // TODO: can we avoid the `as` cast?
      return (str !== ("false" as unknown)) as URLParamValues[K];
    case "debug-simultaneous":
      // TODO: can we avoid the `as` cast?
      return (str !== ("false" as unknown)) as URLParamValues[K];
    default:
      // TODO: can we avoid the `as` cast?
      return str as URLParamValues[K];
  }
}

export function setURLParams(newParams: Partial<URLParamValues>): void {
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
      case "experimental-setup-alg":
        setParam(key, (value as Alg).toString());
        break;
      case "alg":
        setParam(key, (value as Alg).toString());
        break;
      case "puzzle":
        setParam(key, value as string);
        break;
      case "debug-js":
        setParam(key, (value as boolean).toString());
        break;
      case "debug-simultaneous":
        setParam(key, (value as boolean).toString());
        break;
      default:
        console.warn("Unknown param", key, value);
    }
  }
  window.history.replaceState("", "", url.toString());
}
