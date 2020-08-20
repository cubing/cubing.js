import { parse, Sequence } from "../../alg";
import {
  Combine,
  Invert,
  KPuzzle,
  Puzzles,
  Transformation,
} from "../../kpuzzle";
import {
  identityPermutation,
  lexicographicIdxToPermutation,
  maskToOrientationRange,
  orientationRangeToMask,
  permutationTolexicographicIdx,
} from "./orbit-indexing";

type Binary3x3x3State = ArrayBuffer;

// Bit lengths of the encoded components, in order.
const BIT_LENGTHS = [16, 13, 3, 29, 2, 1, 12, 12];

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
  const r: number[] = [];
  for (const bitLength of bitLengths) {
    while (bits < bitLength) {
      accum = (accum << 8) | u8buffy[at++];
      bits += 8;
    }
    r.push((accum >> (bits - bitLength)) & ((1 << bitLength) - 1));
    bits -= bitLength;
  }
  return r;
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

function puzzleOrientationIdx(state: Transformation): [number, number] {
  const idxU = state["CENTER"].permutation[0];
  const idxD = state["CENTER"].permutation[5];
  const unadjustedIdxL = state["CENTER"].permutation[1];
  let idxL = unadjustedIdxL;
  if (idxU < unadjustedIdxL) {
    idxL--;
  }
  if (idxD < unadjustedIdxL) {
    idxL--;
  }
  return [idxU, idxL];
}

const puzzleOrientationCache: Transformation[][] = new Array(6)
  .fill(0)
  .map(() => {
    return new Array(6);
  });

// We use a new block to avoid keeping a reference to temporary vars.
{
  const orientationKpuzzle = new KPuzzle(Puzzles["3x3x3"]);
  const uAlgs: Sequence[] = ["", "z", "x", "z'", "x'", "x2"].map((s) =>
    parse(s),
  );
  const yAlg = parse("y");
  for (const uAlg of uAlgs) {
    orientationKpuzzle.reset();
    orientationKpuzzle.applyAlg(uAlg);
    for (let i = 0; i < 4; i++) {
      orientationKpuzzle.applyAlg(yAlg);
      const [idxU, idxL] = puzzleOrientationIdx(orientationKpuzzle.state);
      puzzleOrientationCache[idxU][idxL] = Invert(
        Puzzles["3x3x3"],
        orientationKpuzzle.state,
      );
    }
  }
}

function orientPuzzle(s: Transformation): Transformation {
  const [idxU, idxL] = puzzleOrientationIdx(s);
  const orientationTransformation = puzzleOrientationCache[idxU][idxL];
  return Combine(Puzzles["3x3x3"], s, orientationTransformation);
}

// TODO: combine with `orientPuzzle`?
function reverseOrientPuzzle(
  s: Transformation,
  idxU: number,
  idxL: number,
): Transformation {
  const orientationTransformation = Invert(
    Puzzles["3x3x3"],
    puzzleOrientationCache[idxU][idxL],
  );
  return Combine(Puzzles["3x3x3"], s, orientationTransformation);
}

// These fields are sorted by the order in which they appear in the binary format.
interface Binary3x3x3Components {
  edgePermutationIdx: number; // 29 bits
  puzzleOrientationIdxU: number; // 3 bits
  puzzleOrientationIdxL: number; // 2 bits
  centerOrientationSupport: number; // 1 bits
  cornerOrientationMask: number; // 13 bits
  cornerPermutationIdx: number; // 16 bits
  edgeOrientationMask: number; // 12 bits
  centerOrientationMask: number; // 12 bits
}

// 0x111 (for idxU) means "not supported"
function supportsPuzzleOrientation(components: Binary3x3x3Components): boolean {
  return components.puzzleOrientationIdxU !== 7;
}

export function reid3x3x3ToBinaryComponents(
  state: Transformation,
): Binary3x3x3Components {
  const normalizedOrientationState = orientPuzzle(state);

  const edgePermutationIdx = permutationTolexicographicIdx(
    normalizedOrientationState["EDGE"].permutation,
  );

  // Represents the spatial orientation of the puzzle. This is useful for smart puzzles, which don't
  // track orientations using center permutation, but instead convey the overall
  // orientation of the entire puzzle
  const [puzzleOrientationIdxU, puzzleOrientationIdxL] = puzzleOrientationIdx(
    state,
  );

  // We always mark as supported, since we don't support 3x3x3 states without
  // center info yet. (note: this means that we always set this as true in a
  // round-trip).
  const centerOrientationSupport = 1;

  const cornerOrientationMask = orientationRangeToMask(
    3,
    normalizedOrientationState["CORNER"].orientation,
    0,
    8,
  );

  const cornerPermutationIdx = permutationTolexicographicIdx(
    normalizedOrientationState["CORNER"].permutation,
  );

  const edgeOrientationMask = orientationRangeToMask(
    2,
    normalizedOrientationState["EDGE"].orientation,
    0,
    12,
  );

  // This is at the end because it allows trimming 12 bits at the end (without
  // affecting how the earlier bits are interpreted) for applications that don't
  // support center orientation and are *super* space constrained.
  const centerOrientationMask = orientationRangeToMask(
    4,
    normalizedOrientationState["CENTER"].orientation,
    0,
    6,
  );

  return {
    cornerPermutationIdx,
    cornerOrientationMask,
    puzzleOrientationIdxU,
    edgePermutationIdx,
    puzzleOrientationIdxL,
    centerOrientationSupport,
    edgeOrientationMask,
    centerOrientationMask,
  };
}

export function binaryComponentsToTwizzleBinary(
  components: Binary3x3x3Components,
): Binary3x3x3State {
  const {
    cornerPermutationIdx,
    cornerOrientationMask,
    puzzleOrientationIdxU,
    edgePermutationIdx,
    puzzleOrientationIdxL,
    centerOrientationSupport,
    edgeOrientationMask,
    centerOrientationMask,
  } = components;

  return concatBinary(BIT_LENGTHS, [
    cornerPermutationIdx,
    cornerOrientationMask,
    puzzleOrientationIdxU,
    edgePermutationIdx,
    puzzleOrientationIdxL,
    centerOrientationSupport,
    edgeOrientationMask,
    centerOrientationMask,
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
    cornerPermutationIdx,
    cornerOrientationMask,
    puzzleOrientationIdxU,
    edgePermutationIdx,
    puzzleOrientationIdxL,
    centerOrientationSupport,
    edgeOrientationMask,
    centerOrientationMask,
  ] = splitBinary(BIT_LENGTHS, buffer);

  return {
    cornerPermutationIdx,
    cornerOrientationMask,
    puzzleOrientationIdxU,
    edgePermutationIdx,
    puzzleOrientationIdxL,
    centerOrientationSupport,
    edgeOrientationMask,
    centerOrientationMask,
  };
}

export function binaryComponentsToReid3x3x3(
  components: Binary3x3x3Components,
): Transformation {
  if (components.centerOrientationSupport !== 1) {
    throw new Error("Must support center orientation.");
  }

  const normalizedOrientationState = {
    EDGE: {
      permutation: lexicographicIdxToPermutation(
        12,
        components.edgePermutationIdx,
      ),
      orientation: maskToOrientationRange(
        2,
        12,
        components.edgeOrientationMask,
      ),
    },
    CORNER: {
      permutation: lexicographicIdxToPermutation(
        8,
        components.cornerPermutationIdx,
      ),
      orientation: maskToOrientationRange(
        3,
        8,
        components.cornerOrientationMask,
      ),
    },
    CENTER: {
      permutation: identityPermutation(6),
      orientation: maskToOrientationRange(
        4,
        6,
        components.centerOrientationMask,
      ),
    },
  };

  if (!supportsPuzzleOrientation(components)) {
    return normalizedOrientationState;
  }

  return reverseOrientPuzzle(
    normalizedOrientationState,
    components.puzzleOrientationIdxU,
    components.puzzleOrientationIdxL,
  );
}

// Returns a list of error string.
// An empty list means validation success.
function validateComponents(components: Binary3x3x3Components): string[] {
  const errors = [];
  if (
    components.edgePermutationIdx < 0 ||
    components.edgePermutationIdx >= 479001600
  ) {
    errors.push(
      `edgePermutationIdx (${components.edgePermutationIdx}) out of range`,
    );
  }
  if (
    components.cornerPermutationIdx < 0 ||
    components.cornerPermutationIdx >= 40320
  ) {
    errors.push(
      `cornerPermutationIdx (${components.cornerPermutationIdx}) out of range`,
    );
  }
  if (
    components.cornerOrientationMask < 0 ||
    components.cornerOrientationMask >= 6561
  ) {
    errors.push(
      `cornerOrientationMask (${components.cornerOrientationMask}) out of range`,
    );
  }
  if (
    components.puzzleOrientationIdxU < 0 ||
    components.puzzleOrientationIdxU >= 6
  ) {
    // 0x111 (for idxU) means "not supported"
    if (supportsPuzzleOrientation(components)) {
      errors.push(
        `puzzleOrientationIdxU (${components.puzzleOrientationIdxU}) out of range`,
      );
    }
  }
  // The following cannot be (f decoded from binary properl) out of rangey.
  if (
    components.edgeOrientationMask < 0 ||
    components.edgeOrientationMask >= 4096
  ) {
    errors.push(
      `edgeOrientationMask (${components.edgeOrientationMask}) out of range`,
    );
  }
  if (
    components.centerOrientationMask < 0 ||
    components.centerOrientationMask >= 4096
  ) {
    errors.push(
      `centerOrientationMask (${components.centerOrientationMask}) out of range`,
    );
  }
  if (
    components.puzzleOrientationIdxL < 0 ||
    components.puzzleOrientationIdxL >= 4
  ) {
    errors.push(
      `puzzleOrientationIdxL (${components.puzzleOrientationIdxL}) out of range`,
    );
  }
  if (
    components.centerOrientationSupport < 0 ||
    components.centerOrientationSupport >= 2
  ) {
    errors.push(
      `centerOrientationSupport (${components.centerOrientationSupport}) out of range`,
    );
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
