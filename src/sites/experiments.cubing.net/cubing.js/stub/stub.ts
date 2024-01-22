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
}
const R = PieceMask.Regular;
const I = PieceMask.Ignore;
type PatternMask = Record<string /* orbit name */, PieceMask[]>;

const rouxSecondBlockPatternMask: PatternMask = {
  EDGES: [I, I, I, I, I, R, I, R, R, R, R, R],
  CORNERS: [I, I, I, I, R, R, R, R],
  CENTERS: [I, R, I, R, I, I],
};

const IGNORED_PIECE_VALUE = 99; // TODO: This should really be set to the lowest otherwise unused piece number in the orbit.

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

const solvedPatternsByDRF: Record<
  number /* DRF piece */,
  Record<number /* DRF orientation */, KPattern>
> = {};
const DRF_ORBIT = "CORNERS";
const DRF_INDEX = 4;
// Assumes DRF is a piece with known piece number and orientation.
function extractDRFCoordinates(pattern: KPattern): {
  pieceDRF: number;
  orientationDRF: number;
} {
  const orbitData = pattern.patternData[DRF_ORBIT];
  if ((orbitData.orientationMod?.[DRF_INDEX] ?? 0) !== 0) {
    throw new Error("Unexpected partially known orientation");
  }
  return {
    pieceDRF: orbitData.pieces[DRF_INDEX],
    orientationDRF: orbitData.orientation[DRF_INDEX],
  };
}
for (const cubeOrientation of cubeOrientations) {
  const orientedPattern = orientedSolvedPattern.applyTransformation(
    cubeOrientation.inverseTransformation,
  );
  const maskedPattern = applyPatternMask(
    orientedPattern,
    rouxSecondBlockPatternMask,
  );
  const { pieceDRF, orientationDRF } = extractDRFCoordinates(orientedPattern);
  const byOrientation = (solvedPatternsByDRF[pieceDRF] ??= {});
  byOrientation[orientationDRF] = maskedPattern;
}

function isRouxSecondBlockSolved(
  candidateFull3x3x3Pattern: KPattern,
): { isSolved: false } | { isSolved: true; algToNormalize: Alg } {
  for (const cubeOrientation of cubeOrientations) {
    const reorientedCandidate = candidateFull3x3x3Pattern.applyTransformation(
      cubeOrientation.inverseTransformation,
    );
    const candidateMasked = applyPatternMask(
      reorientedCandidate,
      rouxSecondBlockPatternMask,
    );
    const { pieceDRF, orientationDRF } =
      extractDRFCoordinates(reorientedCandidate);
    const solvedPatternByDRF = solvedPatternsByDRF[pieceDRF][orientationDRF];
    if (candidateMasked.isIdentical(solvedPatternByDRF)) {
      const { algToNormalize } = cubeOrientation;
      return { isSolved: true, algToNormalize };
    }
  }
  return { isSolved: false };
}

function test(candidate: KPattern) {
  const isSolvedInfo = isRouxSecondBlockSolved(candidate);
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
