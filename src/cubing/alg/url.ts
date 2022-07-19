import type { Alg } from "./Alg";

// This is not the most sophisticated scheme, but it has been used in production
// at alg.cubing.net for years.
function serializeURLParam(a: Alg): string {
  let escaped = a.toString();
  escaped = escaped.replace(/_/g, "&#95;").replace(/ /g, "_");
  escaped = escaped.replace(/\+/g, "&#2b;");
  escaped = escaped.replace(/-/g, "&#45;").replace(/'/g, "-");
  return escaped;
}

export interface AlgCubingNetOptions {
  alg?: Alg;
  setup?: Alg;
  title?: string;
  puzzle?:
    | "1x1x1"
    | "2x2x2"
    | "3x3x3"
    | "4x4x4"
    | "5x5x5"
    | "6x6x6"
    | "7x7x7"
    | "8x8x8"
    | "9x9x9"
    | "10x10x10"
    | "11x11x11"
    | "12x12x12"
    | "13x13x13"
    | "14x14x14"
    | "16x16x16"
    | "17x17x17";
  stage?:
    | "full"
    | "cross"
    | "F2L"
    | "LL"
    | "OLL"
    | "PLL"
    | "CLS"
    | "ELS"
    | "L6E"
    | "CMLL"
    | "WV"
    | "ZBLL"
    | "void";
  view?: "editor" | "playback" | "fullscreen";
  type?: "moves" | "reconstruction" | "alg" | "reconstruction-end-with-setup";
}

// TODO: runtime validation?
/** @deprecated */
export function experimentalAlgCubingNetLink(
  options: AlgCubingNetOptions,
): string {
  const url = new URL("https://alg.cubing.net");
  if (!options.alg) {
    throw new Error("An alg parameter is required.");
  }
  url.searchParams.set("alg", serializeURLParam(options.alg));

  if (options.setup) {
    url.searchParams.set("setup", serializeURLParam(options.setup));
  }
  if (options.title) {
    url.searchParams.set("title", options.title);
  }
  if (options.puzzle) {
    if (
      ![
        "1x1x1",
        "2x2x2",
        "3x3x3",
        "4x4x4",
        "5x5x5",
        "6x6x6",
        "7x7x7",
        "8x8x8",
        "9x9x9",
        "10x10x10",
        "11x11x11",
        "12x12x12",
        "13x13x13",
        "14x14x14",
        "16x16x16",
        "17x17x17",
      ].includes(options.puzzle)
    ) {
      throw new Error(`Invalid puzzle parameter: ${options.puzzle}`);
    }
    url.searchParams.set("puzzle", options.puzzle);
  }
  if (options.stage) {
    if (
      ![
        "full",
        "cross",
        "F2L",
        "LL",
        "OLL",
        "PLL",
        "CLS",
        "ELS",
        "L6E",
        "CMLL",
        "WV",
        "ZBLL",
        "void",
      ].includes(options.stage)
    ) {
      throw new Error(`Invalid stage parameter: ${options.stage}`);
    }
    url.searchParams.set("stage", options.stage);
  }
  if (options.view) {
    if (!["editor", "playback", "fullscreen"].includes(options.view)) {
      throw new Error(`Invalid view parameter: ${options.view}`);
    }
    url.searchParams.set("view", options.view);
  }
  if (options.type) {
    if (
      ![
        "moves",
        "reconstruction",
        "alg",
        "reconstruction-end-with-setup",
      ].includes(options.type)
    ) {
      throw new Error(`Invalid type parameter: ${options.type}`);
    }
    url.searchParams.set("type", options.type);
  }
  return url.toString();
}
