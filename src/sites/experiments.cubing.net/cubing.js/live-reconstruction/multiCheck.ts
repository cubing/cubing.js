// Stub file for testing.
// Feel free to add code here if you need a quick place to run some code, but avoid committing any changes.

// For: https://github.com/cubing/cubing.js/issues/317

import { Alg, AlgBuilder, Move } from "../../../../cubing/alg";
import {
  KPattern,
  type KPatternData,
  type KPatternOrbitData,
  KTransformation,
} from "../../../../cubing/kpuzzle";
import { cube3x3x3 } from "../../../../cubing/puzzles";

enum PieceMask {
  Regular,
  Ignore,
  OrientationOnly,
}
const R = PieceMask.Regular;
const I = PieceMask.Ignore;
const O = PieceMask.OrientationOnly;
type PatternMask = Record<string /* orbit name */, PieceMask[]>;

const IGNORED_PIECE_VALUE = 9999; // TODO: This should really be set to the lowest otherwise unused piece number in the orbit.
const ORIENTATION_ONLY_PIECE_VALUE = 9998; // TODO: This should really be set to the lowest otherwise unused piece number in the orbit.

function applyPatternMask(pattern: KPattern, mask: PatternMask): KPattern {
  const newPatternData: KPatternData = {};
  for (const orbitDefinition of kpuzzle.definition.orbits) {
    const patternOrbit = pattern.patternData[orbitDefinition.orbitName];
    const maskOrbit = mask[orbitDefinition.orbitName];
    const newOrbitData: KPatternOrbitData & { orientationMod: number[] } = {
      pieces: [],
      orientation: [],
      orientationMod: [],
    };

    for (let i = 0; i < orbitDefinition.numPieces; i++) {
      switch (maskOrbit[i]) {
        case PieceMask.Regular: {
          newOrbitData.pieces.push(patternOrbit.pieces[i]);
          newOrbitData.orientation.push(patternOrbit.orientation[i]);
          newOrbitData.orientationMod.push(
            patternOrbit.orientationMod?.[i] ?? 0,
          );
          break;
        }
        case PieceMask.Ignore: {
          newOrbitData.pieces.push(IGNORED_PIECE_VALUE);
          newOrbitData.orientation.push(0);
          newOrbitData.orientationMod.push(1);
          break;
        }
        case PieceMask.OrientationOnly: {
          newOrbitData.pieces.push(ORIENTATION_ONLY_PIECE_VALUE);
          newOrbitData.orientation.push(patternOrbit.orientation[i]);
          newOrbitData.orientationMod.push(
            patternOrbit.orientationMod?.[i] ?? 0,
          );
          break;
        }
        default: {
          throw new Error("Unrecognized `PieceMaskAction` value.");
        }
      }
    }
    newPatternData[orbitDefinition.orbitName] = newOrbitData;
  }
  return new KPattern(pattern.kpuzzle, newPatternData);
}

const kpuzzle = await cube3x3x3.kpuzzle();

const cubeOrientations: {
  inverseTransformation: KTransformation;
  algToNormalize: Alg;
}[] = [];
for (const moveToSetU of [
  null,
  new Move("x"),
  new Move("x2"),
  new Move("x'"),
  new Move("z"),
  new Move("z'"),
]) {
  for (const moveToSetF of [
    null,
    new Move("y"),
    new Move("y2"),
    new Move("y'"),
  ]) {
    const algBuilder: AlgBuilder = new AlgBuilder();
    if (moveToSetU) {
      algBuilder.push(moveToSetU);
    }
    if (moveToSetF) {
      algBuilder.push(moveToSetF);
    }
    const algToNormalize = algBuilder.toAlg();
    const inverseTransformation = kpuzzle.algToTransformation(algToNormalize);
    cubeOrientations.push({
      inverseTransformation,
      algToNormalize,
    });
  }
}

const orientedSolvedPattern: KPattern = kpuzzle.defaultPattern();

interface OrientationAnchor {
  orbitName: string;
  pieceIndex: number;
}

interface AnchorCoordinates {
  anchorPieceIndex: number;
  anchorOrientationIndex: number;
}

class PatternChecker {
  solvedPatternsByAnchorCoordinates: Record<
    number /* DRF piece */,
    Record<number /* DRF orientation */, KPattern>
  > = {};
  constructor(
    private patternMask: PatternMask,
    private orientationAnchor: OrientationAnchor,
  ) {
    for (const cubeOrientation of cubeOrientations) {
      const orientedPattern = orientedSolvedPattern.applyTransformation(
        cubeOrientation.inverseTransformation,
      );
      const maskedPattern = applyPatternMask(orientedPattern, patternMask);
      const { anchorPieceIndex, anchorOrientationIndex } =
        this.extractAnchorCoordinates(orientedPattern);
      const byOrientation = (this.solvedPatternsByAnchorCoordinates[
        anchorPieceIndex
      ] ??= {});
      byOrientation[anchorOrientationIndex] = maskedPattern;
    }
  }

  extractAnchorCoordinates(pattern: KPattern): AnchorCoordinates {
    const orbitData = pattern.patternData[this.orientationAnchor.orbitName];
    if (
      (orbitData.orientationMod?.[this.orientationAnchor.pieceIndex] ?? 0) !== 0
    ) {
      throw new Error("Unexpected partially known orientation");
    }
    return {
      anchorPieceIndex: orbitData.pieces[this.orientationAnchor.pieceIndex],
      anchorOrientationIndex:
        orbitData.orientation[this.orientationAnchor.pieceIndex],
    };
  }

  check(
    candidateFull3x3x3Pattern: KPattern,
  ): { isSolved: false } | { isSolved: true; algToNormalize: Alg } {
    for (const cubeOrientation of cubeOrientations) {
      const reorientedCandidate = candidateFull3x3x3Pattern.applyTransformation(
        cubeOrientation.inverseTransformation,
      );
      const candidateMasked = applyPatternMask(
        reorientedCandidate,
        this.patternMask,
      );
      const { anchorPieceIndex, anchorOrientationIndex } =
        this.extractAnchorCoordinates(reorientedCandidate);
      const solvedPatternByDRF =
        this.solvedPatternsByAnchorCoordinates[anchorPieceIndex][
          anchorOrientationIndex
        ];
      if (candidateMasked.isIdentical(solvedPatternByDRF)) {
        const { algToNormalize } = cubeOrientation;
        return { isSolved: true, algToNormalize };
      }
    }
    return { isSolved: false };
  }
}

const CrossPatternChecker = new PatternChecker(
  {
    EDGES: [I, I, I, I, R, R, R, R, I, I, I, I],
    CORNERS: [I, I, I, I, I, I, I, I],
    CENTERS: [I, R, R, R, R, R],
  },
  { orbitName: "EDGES", pieceIndex: 5 },
);

const F2L1SlotPatternChecker = new PatternChecker(
  {
    EDGES: [I, I, I, I, R, R, R, R, R, I, I, I],
    CORNERS: [I, I, I, I, R, I, I, I],
    CENTERS: [I, R, R, R, R, R],
  },
  { orbitName: "EDGES", pieceIndex: 5 },
);

const F2LAdjacent2SlotsPatternChecker = new PatternChecker(
  {
    EDGES: [I, I, I, I, R, R, R, R, R, R, I, I],
    CORNERS: [I, I, I, I, R, R, I, I],
    CENTERS: [I, R, R, R, R, R],
  },
  { orbitName: "EDGES", pieceIndex: 5 },
);

const F2LOpposite2SlotsPatternChecker = new PatternChecker(
  {
    EDGES: [I, I, I, I, R, R, R, R, R, I, I, R],
    CORNERS: [I, I, I, I, R, I, R, I],
    CENTERS: [I, R, R, R, R, R],
  },
  { orbitName: "EDGES", pieceIndex: 5 },
);

const F2L3SlotsPatternChecker = new PatternChecker(
  {
    EDGES: [I, I, I, I, R, R, R, R, I, R, R, R],
    CORNERS: [I, I, I, I, I, R, R, R],
    CENTERS: [I, R, R, R, R, R],
  },
  { orbitName: "EDGES", pieceIndex: 5 },
);

const F2LPatternChecker = new PatternChecker(
  {
    EDGES: [I, I, I, I, R, R, R, R, R, R, R, R],
    CORNERS: [I, I, I, I, R, R, R, R],
    CENTERS: [I, R, R, R, R, R],
  },
  { orbitName: "EDGES", pieceIndex: 5 },
);

const ELSPatternChecker = new PatternChecker(
  {
    EDGES: [O, O, O, O, R, R, R, R, R, R, R, R, R],
    CORNERS: [I, I, I, I, I, R, R, R],
    CENTERS: [O, R, R, R, R, R],
  },
  { orbitName: "EDGES", pieceIndex: 8 },
);

const LLOrientedPatternChecker = new PatternChecker(
  {
    EDGES: [O, O, O, O, R, R, R, R, R, R, R, R],
    CORNERS: [O, O, O, O, R, R, R, R],
    CENTERS: [O, R, R, R, R, R],
  },
  { orbitName: "EDGES", pieceIndex: 5 },
);

const SolvedPatternChecker = new PatternChecker(
  {
    EDGES: [R, R, R, R, R, R, R, R, R, R, R, R],
    CORNERS: [R, R, R, R, R, R, R, R],
    CENTERS: [R, R, R, R, R, R],
  },
  { orbitName: "EDGES", pieceIndex: 5 },
);

export function multiCheck(pattern: KPattern): string {
  const signatureEntries: string[] = [];
  function singleCheck(
    name: string,
    checker: PatternChecker,
    candidate: KPattern,
  ) {
    const isSolvedInfo = checker.check(candidate);
    if (isSolvedInfo.isSolved) {
      console.log(
        `[${name}] Solved, orient using: ${
          isSolvedInfo.algToNormalize.experimentalIsEmpty()
            ? "(empty alg)"
            : isSolvedInfo.algToNormalize
        }`,
      );
      signatureEntries.splice(0); // TOFO
      signatureEntries.push(name);
    } else {
      console.log(`[${name}] Unsolved`);
    }
  }

  singleCheck("Cross", CrossPatternChecker, pattern);
  singleCheck("F2L — 1 slot", F2L1SlotPatternChecker, pattern);
  singleCheck(
    "F2L — 2 slots (adjacent)",
    F2LAdjacent2SlotsPatternChecker,
    pattern,
  );
  singleCheck(
    "F2L — 2 slots (opposite)",
    F2LOpposite2SlotsPatternChecker,
    pattern,
  );
  singleCheck("F2L — 3 slots", F2L3SlotsPatternChecker, pattern);
  singleCheck("F2L", F2LPatternChecker, pattern);
  singleCheck("ELS", ELSPatternChecker, pattern);
  singleCheck("LL oriented", LLOrientedPatternChecker, pattern);
  singleCheck("Solved", SolvedPatternChecker, pattern);

  return signatureEntries.join(" + ");
}

// multiCheck(
//   new Alg(`
// R2 L2 F U' F B2 U L2 U2 R2 B L2 B' L2 D2 R2 F R2 B'

// y' x U2' L2 x U2' R U R' U' R // X-Cross
// U' R U R' L U' L' // Slot 2
// R U' R' U' L' U' L // Slot 3 + ELS
// `),
// );
