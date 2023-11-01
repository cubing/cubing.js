// Stub file for testing.
// Feel free to add code here if you need a quick place to run some code, but avoid committing any changes.

import {
  KPuzzle,
  type KPatternData,
  type KPuzzleDefinition,
  KTransformation,
} from "cubing/kpuzzle";
import type {
  KPuzzleOrbitDefinition,
  KTransformationData,
} from "cubing/kpuzzle/KPuzzleDefinition";
import { modIntoRange } from "cubing/twisty/model/helpers";

export function remapSVG(
  svgString: string,
  def: KPuzzleDefinition,
  transformationData: KTransformationData,
): string {
  const elem = document.createElement("svg");
  elem.innerHTML = svgString;

  const elemsReferencesByOriginalID: Record<string, Element> = {};
  for (const orbitDefinition of def.orbits) {
    for (let idx = 0; idx < orbitDefinition.numPieces; idx++) {
      for (let ori = 0; ori < orbitDefinition.numOrientations; ori++) {
        const id = `${orbitDefinition.orbitName}-l${idx}-o${ori}`;
        elemsReferencesByOriginalID[id] = elem.querySelector(`#${id}`)!;
      }
    }
  }

  for (const orbitDefinition of def.orbits) {
    const orbit = transformationData[orbitDefinition.orbitName];
    for (let idx = 0; idx < orbitDefinition.numPieces; idx++) {
      for (let ori = 0; ori < orbitDefinition.numOrientations; ori++) {
        const transformedIdx = orbit.permutation[idx];
        const transformedOri = modIntoRange(
          orbit.orientationDelta[idx] + ori, // TODO
          0,
          orbitDefinition.numOrientations,
        );
        const originalID = `${orbitDefinition.orbitName}-l${idx}-o${ori}`;
        const transformedID = `${orbitDefinition.orbitName}-l${transformedIdx}-o${transformedOri}`;
        elemsReferencesByOriginalID[transformedID].id = originalID;
      }
    }
  }

  console.log(elemsReferencesByOriginalID);

  return elem.innerHTML;
}

export function remapKPuzzleDefinition(
  def: KPuzzleDefinition,
  transformationData: KTransformationData,
): KPuzzleDefinition {
  const kpuzzle = new KPuzzle(def);
  const transformation = new KTransformation(kpuzzle, transformationData);
  const transformationInverse = transformation.invert();

  // const name: string = `${def.name}-remapped`;
  const name: string = `${def.name}`;
  const orbits: KPuzzleOrbitDefinition[] = structuredClone(def.orbits);

  const defaultPattern: KPatternData = structuredClone(def.defaultPattern);
  // kpuzzle
  //   .defaultPattern()
  //   .applyTransformation(transformation).patternData;

  const moves: Record<string, KTransformationData> = {};
  for (const [moveName, moveDef] of Object.entries(def.moves)) {
    const moveTransformation = new KTransformation(kpuzzle, moveDef);
    moves[moveName] = transformationInverse
      .applyTransformation(moveTransformation)
      .applyTransformation(transformation).transformationData;
  }

  const remappedDef: KPuzzleDefinition = {
    name,
    orbits,
    defaultPattern,
    moves,
  };
  if (remappedDef.derivedMoves) {
    remappedDef.derivedMoves = structuredClone(def.derivedMoves);
  }
  if (remappedDef.derivedMoves) {
    remappedDef.derivedMoves = structuredClone(def.derivedMoves);
  }

  return remappedDef;
}

// console.log(
//   (await cube4x4x4.kpuzzle()).identityTransformation().transformationData,
// );

// const transformationData = {
//   CORNERS: {
//     permutation: [4, 5, 6, 7, 0, 1, 2, 3],
//     orientationDelta: [0, 0, 0, 0, 0, 0, 0, 0],
//   },
//   EDGES: {
//     permutation: [
//       0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20,
//       21, 22, 23,
//     ],
//     orientationDelta: [
//       0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
//     ],
//   },
//   CENTERS: {
//     permutation: [
//       0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20,
//       21, 22, 23,
//     ],
//     orientationDelta: [
//       0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
//     ],
//   },
// };
