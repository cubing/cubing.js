import { Transformation } from "../../kpuzzle";
import {
  identityPermutation,
  lexToPermutation,
  maskToOrientations,
  orientationsToMask,
  permutationToLex,
} from "./orbit-indexing";
import {
  normalizePuzzleOrientation,
  puzzleOrientationIdx,
  reorientPuzzle,
} from "./puzzle-orientation";

type Binary3x3x3State = ArrayBuffer;

// Bit lengths of the encoded components, in order.
const BIT_LENGTHS = [29, 12, 16, 13, 3, 2, 1, 12];

// These fields are sorted by the order in which they appear in the binary format.
export interface Binary3x3x3Components {
  epLex: number; // 29 bits, edge permutation
  eoMask: number; // 12 bits, edge orientation
  cpLex: number; // 16 bits, corner permutation
  coMask: number; // 13 bits, corner orientation
  poIdxU: number; // 3 bits, puzzle orientation (U face)
  poIdxL: number; // 2 bits, puzzle orientation (L face)
  moSupport: number; // 1 bit, center orientation support
  moMask: number; // 12 bits, center orientation
}

// There are various clever ways to do this, but this is simple and efficient.
function arraySum(arr: number[]): number {
  let total = 0;
  for (const entry of arr) {
    total += entry;
  }
  return total;
}

// Due to limitations in JS bit operations, this is unsafe if any of the bit lengths span across the contents of more than 4 bytes.
// - Safe: [8, 32]
// - Unsafe: [4, 32, 4]
// - Unsafe: [40, 4]
function splitBinary(bitLengths: number[], buffy: ArrayBuffer): number[] {
  const u8buffy = new Uint8Array(buffy);
  let at = 0;
  let bits = 0;
  let accum = 0;
  const values: number[] = [];
  for (const bitLength of bitLengths) {
    while (bits < bitLength) {
      accum = (accum << 8) | u8buffy[at++];
      bits += 8;
    }
    values.push((accum >> (bits - bitLength)) & ((1 << bitLength) - 1));
    bits -= bitLength;
  }
  return values;
}

// See above for safety notes.
function concatBinary(bitLengths: number[], values: number[]): ArrayBuffer {
  const buffy = new Uint8Array(Math.ceil(arraySum(bitLengths) / 8));
  let at = 0;
  let bits = 0;
  let accum = 0;
  for (let i = 0; i < bitLengths.length; i++) {
    accum = (accum << bitLengths[i]) | values[i];
    bits += bitLengths[i];
    while (bits >= 8) {
      buffy[at++] = accum >> (bits - 8);
      bits -= 8;
    }
  }
  if (bits > 0) {
    buffy[at++] = accum << (8 - bits);
  }
  return buffy;
}

// 0x111 (for idxU) means "not supported"
function supportsPuzzleOrientation(components: Binary3x3x3Components): boolean {
  return components.poIdxU !== 7;
}

export function reid3x3x3ToBinaryComponents(
  state: Transformation,
): Binary3x3x3Components {
  const normedState = normalizePuzzleOrientation(state);

  const epLex = permutationToLex(normedState["EDGES"].permutation);
  const eoMask = orientationsToMask(2, normedState["EDGES"].orientation);
  const cpLex = permutationToLex(normedState["CORNERS"].permutation);
  const coMask = orientationsToMask(3, normedState["CORNERS"].orientation);
  const [poIdxU, poIdxL] = puzzleOrientationIdx(state);
  const moSupport = 1; // Required for now.
  const moMask = orientationsToMask(4, normedState["CENTERS"].orientation);

  return {
    epLex,
    eoMask,
    cpLex,
    coMask,
    poIdxU,
    poIdxL,
    moSupport,
    moMask,
  };
}

export function binaryComponentsToTwizzleBinary(
  components: Binary3x3x3Components,
): Binary3x3x3State {
  const {
    epLex,
    eoMask,
    cpLex,
    coMask,
    poIdxU,
    poIdxL,
    moSupport,
    moMask,
  } = components;

  return concatBinary(BIT_LENGTHS, [
    epLex,
    eoMask,
    cpLex,
    coMask,
    poIdxU,
    poIdxL,
    moSupport,
    moMask,
  ]);
}

export function reid3x3x3ToTwizzleBinary(
  state: Transformation,
): Binary3x3x3State {
  const components: Binary3x3x3Components = reid3x3x3ToBinaryComponents(state);
  return binaryComponentsToTwizzleBinary(components);
}

export function twizzleBinaryToBinaryComponents(
  buffer: ArrayBuffer,
): Binary3x3x3Components {
  const [
    epLex,
    eoMask,
    cpLex,
    coMask,
    poIdxU,
    poIdxL,
    moSupport,
    moMask,
  ] = splitBinary(BIT_LENGTHS, buffer);

  return {
    epLex,
    eoMask,
    cpLex,
    coMask,
    poIdxU,
    poIdxL,
    moSupport,
    moMask,
  };
}

export function binaryComponentsToReid3x3x3(
  components: Binary3x3x3Components,
): Transformation {
  if (components.moSupport !== 1) {
    throw new Error("Must support center orientation.");
  }

  const normedState = {
    EDGES: {
      permutation: lexToPermutation(12, components.epLex),
      orientation: maskToOrientations(2, 12, components.eoMask),
    },
    CORNERS: {
      permutation: lexToPermutation(8, components.cpLex),
      orientation: maskToOrientations(3, 8, components.coMask),
    },
    CENTERS: {
      permutation: identityPermutation(6),
      orientation: maskToOrientations(4, 6, components.moMask),
    },
  };

  if (!supportsPuzzleOrientation(components)) {
    return normedState;
  }

  return reorientPuzzle(normedState, components.poIdxU, components.poIdxL);
}

// Returns a list of error string.
// An empty list means validation success.
function validateComponents(components: Binary3x3x3Components): string[] {
  const errors = [];
  if (components.epLex < 0 || components.epLex >= 479001600) {
    errors.push(`epLex (${components.epLex}) out of range`);
  }
  if (components.cpLex < 0 || components.cpLex >= 40320) {
    errors.push(`cpLex (${components.cpLex}) out of range`);
  }
  if (components.coMask < 0 || components.coMask >= 6561) {
    errors.push(`coMask (${components.coMask}) out of range`);
  }
  if (components.poIdxU < 0 || components.poIdxU >= 6) {
    // 0x111 (for idxU) means "not supported"
    if (supportsPuzzleOrientation(components)) {
      errors.push(`poIdxU (${components.poIdxU}) out of range`);
    }
  }
  // The following cannot be (f decoded from binary properl) out of rangey.
  if (components.eoMask < 0 || components.eoMask >= 4096) {
    errors.push(`eoMask (${components.eoMask}) out of range`);
  }
  if (components.moMask < 0 || components.moMask >= 4096) {
    errors.push(`moMask (${components.moMask}) out of range`);
  }
  if (components.poIdxL < 0 || components.poIdxL >= 4) {
    errors.push(`poIdxL (${components.poIdxL}) out of range`);
  }
  if (components.moSupport < 0 || components.moSupport >= 2) {
    errors.push(`moSupport (${components.moSupport}) out of range`);
  }
  return errors;
}

export function twizzleBinaryToReid3x3x3(buffy: ArrayBuffer): Transformation {
  const components = twizzleBinaryToBinaryComponents(buffy);
  const errors = validateComponents(components);
  if (errors.length !== 0) {
    throw new Error(`Invalid binary state components: ${errors.join(", ")}`);
  }
  return binaryComponentsToReid3x3x3(components);
}
