import { Alg } from "../../../../cubing/alg";
import type { QuantumDirectionalCancellation } from "../../../../cubing/alg/cubing-private";
import { experimentalStickerings } from "../../../../cubing/puzzles/cubing-private";
import type {
  ExperimentalStickering,
  VisualizationFormat,
} from "../../../../cubing/twisty";
import { visualizationFormats } from "../../../../cubing/twisty/model/props/viewer/VisualizationProp";

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
  fto: true,
  megaminx: true,
  kilominx: true,
  tri_quad: true,
  baby_fto: true,
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

export const DEFAULT_VISUALIZATION = "3D";
export function getVisualizationFormat(): VisualizationFormat {
  return getURLParamChecked<VisualizationFormat>(
    "visualization",
    DEFAULT_VISUALIZATION,
    Object.keys(visualizationFormats) as VisualizationFormat[],
  );
}
export function getStickering(): ExperimentalStickering | null {
  const validValues = (
    Object.keys(experimentalStickerings) as (ExperimentalStickering | null)[]
  ).concat([null]);
  const s = getURLParamChecked<ExperimentalStickering | null>(
    "stickering",
    null,
    validValues,
  );
  return s;
}

export const DEFAULT_TEMPO_SCALE = 1;
export function getTempoScale(): number {
  try {
    return parseFloat(
      new URL(location.href).searchParams.get("tempo-scale") ?? "1",
    );
  } catch {
    console.warn("Invalid tempo scale. Using 1.");
    return 1;
  }
}

export function getSetup(): Alg {
  const setup = new URL(document.location.href).searchParams.get("setup");
  if (!setup) {
    return new Alg();
  }
  try {
    return Alg.fromString(setup);
  } catch {
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

export function getCancel(): string {
  return getURLParamChecked<QuantumDirectionalCancellation>(
    "cancel",
    "any-direction",
    ["same-direction", "any-direction", "none"],
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
