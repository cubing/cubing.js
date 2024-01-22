// Stub file for testing.
// Feel free to add code here if you need a quick place to run some code, but avoid committing any changes.

// For: https://github.com/cubing/cubing.js/issues/317

import { Alg, AlgBuilder, Move } from "cubing/alg";
import {
  KPattern,
  type KPatternData,
  type KPatternOrbitData,
  KTransformation,
} from "cubing/kpuzzle";
import { cube3x3x3 } from "cubing/puzzles";

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
      console.log(candidateMasked.patternData);
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

const rouxSecondBlockPatternChecker = new PatternChecker(
  {
    EDGES: [I, I, I, I, I, R, I, R, R, R, R, R],
    CORNERS: [I, I, I, I, R, R, R, R],
    CENTERS: [I, R, I, R, I, I],
  },
  { orbitName: "CORNERS", pieceIndex: 4 },
);

function test(candidate: KPattern) {
  const isSolvedInfo = rouxSecondBlockPatternChecker.check(candidate);
  if (isSolvedInfo.isSolved) {
    console.log(
      `Solved, orient using: ${
        isSolvedInfo.algToNormalize.experimentalIsEmpty()
          ? "(empty alg)"
          : isSolvedInfo.algToNormalize
      }`,
    );
  } else {
    console.log("Unsolved");
  }
}

test(orientedSolvedPattern.applyAlg("U L F R B D")); // Prints: "Unsolved"
test(orientedSolvedPattern.applyAlg("y b U B' U F R2 F' y'")); // Prints: "Solved, orient using: (empty alg)"
test(orientedSolvedPattern.applyAlg("M' U'")); // Prints: "Solved, orient using: (empty alg)"
test(orientedSolvedPattern.applyAlg("F")); // Prints: "Solved, orient using: x"
test(orientedSolvedPattern.applyAlg("b U B' U F R2 F'")); // Prints: "Solved, orient using: y"
test(orientedSolvedPattern.applyAlg("[S', L]")); // Prints: "Solved, orient using: z y"

const F2LPatternChecker = new PatternChecker(
  {
    EDGES: [I, I, I, I, R, R, R, R, R, R, R, R],
    CORNERS: [I, I, I, I, R, R, R, R],
    CENTERS: [I, R, R, R, R, R],
  },
  { orbitName: "CORNERS", pieceIndex: 4 },
);

console.log(
  F2LPatternChecker.check(orientedSolvedPattern.applyAlg("R U R' U R U2 R'"))
    .isSolved,
);

const ELSPatternChecker = new PatternChecker(
  {
    EDGES: [O, O, O, O, R, R, R, R, R, R, R, R, R],
    CORNERS: [I, I, I, I, I, R, R, R],
    CENTERS: [I, R, R, R, R, R],
  },
  { orbitName: "EDGES", pieceIndex: 8 },
);
console.log(
  F2LPatternChecker.check(orientedSolvedPattern.applyAlg("R U' R' U R U2 R'"))
    .isSolved,
);
console.log(
  ELSPatternChecker.check(orientedSolvedPattern.applyAlg("R U' R' U2 R U' R'"))
    .isSolved,
);
