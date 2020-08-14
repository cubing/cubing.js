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

interface Binary3x3x3Components {
  edgePermutationIdx: number; // 29 bits
  idxPuzzleOrientationU: number; // 3 bits
  idxPuzzleOrientationL: number; // 2 bits
  centerOrientationSupport: number; // 1 bits
  cornerOrientationFirst3Mask: number; // 5 bits
  cornerOrientationLast5Mask: number; // 8 bits
  cornerPermutationIdx: number; // 16 bits
  edgeOrientationMask: number; // 12 bits
  centerOrientationMask: number; // 12 bits
}

// 0x111 (for idxU) + 0x11 (for idxL) means "not supported"
function supportsPuzzleOrientation(components: Binary3x3x3Components): boolean {
  return !(
    components.idxPuzzleOrientationU === 7 &&
    components.idxPuzzleOrientationL === 3
  );
}

function reid3x3x3ToBinaryComponents(
  state: Transformation,
): Binary3x3x3Components {
  const normalizedOrientationState = orientPuzzle(state);

  const edgePermutationIdx = permutationTolexicographicIdx(
    normalizedOrientationState["EDGE"].permutation,
  );

  // Represents the spatial orientation of the puzzle. This is useful for smart puzzles, which don't
  // track orientations using center permutation, but instead convey the overall
  // orientation of the entire puzzle
  const [idxPuzzleOrientationU, idxPuzzleOrientationL] = puzzleOrientationIdx(
    state,
  );

  // We always mark as supported, since we don't support 3x3x3 states without
  // center info yet. (note: this means that we always set this as true in a
  // round-trip).
  const centerOrientationSupport = 1;

  const cornerOrientationFirst3Mask = orientationRangeToMask(
    3,
    normalizedOrientationState["CORNER"].orientation,
    0,
    3,
  );
  const cornerOrientationLast5Mask = orientationRangeToMask(
    3,
    normalizedOrientationState["CORNER"].orientation,
    3,
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
    edgePermutationIdx,
    idxPuzzleOrientationU,
    idxPuzzleOrientationL,
    centerOrientationSupport,
    cornerOrientationFirst3Mask,
    cornerOrientationLast5Mask,
    cornerPermutationIdx,
    edgeOrientationMask,
    centerOrientationMask,
  };
}

export function binaryComponentsToTwizzleBinary(
  components: Binary3x3x3Components,
): Binary3x3x3State {
  const buffy = new Uint8Array(11);

  buffy[0] |= components.edgePermutationIdx >> 21; // (29 - 8 * 1)
  buffy[1] |= components.edgePermutationIdx >> 13; // (29 - 8 * 2)
  buffy[2] |= components.edgePermutationIdx >> 5; // (29 - 8 * 3)
  buffy[3] |= components.edgePermutationIdx << 3;

  buffy[3] |= components.idxPuzzleOrientationU;
  buffy[4] |= components.idxPuzzleOrientationL << 6;

  buffy[4] |= components.centerOrientationSupport << 5;

  buffy[4] |= components.cornerOrientationFirst3Mask;
  buffy[5] |= components.cornerOrientationLast5Mask;

  buffy[6] |= components.cornerPermutationIdx >> 8;
  buffy[7] |= components.cornerPermutationIdx;

  buffy[8] |= components.edgeOrientationMask >> 4;
  buffy[9] |= components.edgeOrientationMask << 4;

  buffy[9] |= components.centerOrientationMask >> 8;
  buffy[10] |= components.centerOrientationMask;

  return buffy;
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
  const u8buffer = new Uint8Array(buffer);
  return {
    edgePermutationIdx:
      (u8buffer[0] << 21) +
      (u8buffer[1] << 13) +
      (u8buffer[2] << 5) +
      (u8buffer[3] >> 3),
    idxPuzzleOrientationU: u8buffer[3] & 0b00000111,
    idxPuzzleOrientationL: (u8buffer[4] & 0b11000000) >> 6,
    centerOrientationSupport: (u8buffer[4] & 0b00100000) >> 5,
    cornerOrientationFirst3Mask: u8buffer[4] & 0b00011111,
    cornerOrientationLast5Mask: u8buffer[5],
    cornerPermutationIdx: (u8buffer[6] << 8) + u8buffer[7],
    edgeOrientationMask: (u8buffer[8] << 4) + (u8buffer[9] >> 4),
    centerOrientationMask: ((u8buffer[9] & 0b00001111) << 8) + u8buffer[10],
  };
}

export function binaryComponentsToReid3x3x3(
  components: Binary3x3x3Components,
): Transformation {
  if (components.centerOrientationSupport !== 1) {
    throw new Error("Must support orientation center.");
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
        3,
        components.cornerOrientationFirst3Mask,
      ).concat(
        maskToOrientationRange(3, 5, components.cornerOrientationLast5Mask),
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
    components.idxPuzzleOrientationU,
    components.idxPuzzleOrientationL,
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
    components.cornerOrientationFirst3Mask < 0 ||
    components.cornerOrientationFirst3Mask >= 27
  ) {
    errors.push(
      `cornerOrientationFirst3Mask (${components.cornerOrientationFirst3Mask}) out of range`,
    );
  }
  if (
    components.cornerOrientationLast5Mask < 0 ||
    components.cornerOrientationLast5Mask >= 243
  ) {
    errors.push(
      `cornerOrientationLast5Mask (${components.cornerOrientationLast5Mask}) out of range`,
    );
  }
  if (
    components.idxPuzzleOrientationU < 0 ||
    components.idxPuzzleOrientationU >= 6
  ) {
    // 0x111 (for idxU) + 0x11 (for idxL) means "not supported"
    if (supportsPuzzleOrientation(components)) {
      errors.push(
        `idxPuzzleOrientationU (${components.idxPuzzleOrientationU}) out of range`,
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
    components.idxPuzzleOrientationL < 0 ||
    components.idxPuzzleOrientationL >= 4
  ) {
    errors.push(
      `idxPuzzleOrientationL (${components.idxPuzzleOrientationL}) out of range`,
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
