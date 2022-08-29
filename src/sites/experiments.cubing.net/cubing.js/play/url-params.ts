import { Alg } from "../../../../cubing/alg";

// Trick from https://github.com/microsoft/TypeScript/issues/28046#issuecomment-480516434
export type StringListAsType<T extends ReadonlyArray<unknown>> =
  T extends ReadonlyArray<infer StringListAsType> ? StringListAsType : never;

function getURLParamChecked<T>(
  name: string,
  defaultValue: T,
  validValues: T[],
): T {
  const value = new URL(document.location.href).searchParams.get(name);
  return validValues.includes(value as unknown as T)
    ? (value as unknown as T)
    : defaultValue;
}

const puzzleIDs = {
  "2x2x2": true,
  "3x3x3": true,
  "4x4x4": true,
  "5x5x5": true,
  "fto": true,
  "megaminx": true,
};
export const DEFAULT_PUZZLE_ID = "3x3x3";
export type PuzzleID = keyof typeof puzzleIDs;

export function getPuzzleID(): PuzzleID {
  return getURLParamChecked<PuzzleID>(
    "puzzle",
    DEFAULT_PUZZLE_ID,
    Object.keys(puzzleIDs) as PuzzleID[],
  );
}

export function getSetup(): Alg {
  const setup = new URL(document.location.href).searchParams.get("setup");
  if (!setup) {
    return new Alg();
  }
  try {
    return Alg.fromString(setup);
  } catch (e) {
    return new Alg();
  }
}

export function debugShowRenderStats(): boolean {
  return (
    getURLParamChecked<"true" | "false">("debugShowRenderStats", "false", [
      "true",
      "false",
    ]) === "true"
  );
}

export function coalesce(): boolean {
  return (
    getURLParamChecked<"true" | "false">("coalesce", "true", [
      "true",
      "false",
    ]) === "true"
  );
}

export function sliceMoves(): boolean {
  return (
    getURLParamChecked<"true" | "false">("sliceMoves", "true", [
      "true",
      "false",
    ]) === "true"
  );
}

export function wideMoves(): boolean {
  return (
    getURLParamChecked<"true" | "false">("wideMoves", "true", [
      "true",
      "false",
    ]) === "true"
  );
}

export function sendingSocketOrigin(): string | null {
  return new URL(document.location.href).searchParams.get(
    "sendingSocketOrigin",
  );
}

export function receivingSocketOrigin(): string | null {
  return new URL(document.location.href).searchParams.get(
    "receivingSocketOrigin",
  );
}
