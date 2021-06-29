import { Alg } from "../../../cubing/alg";
import {
  identityTransformation,
  invertTransformation,
  KPuzzle,
  KPuzzleDefinition,
  Transformation,
} from "../../../cubing/kpuzzle";

interface PieceRef {
  orbitName: string;
  permutationIdx: number;
}

interface PieceLocation extends PieceRef {
  orientation: number;
}

interface SGSLocationInfo {
  alg: Alg;
  transformation: Transformation;
}

export interface SGSCachedData {
  ordering: {
    pieceRef: PieceRef;
    inverseLocations: SGSLocationInfo[][];
  }[];
}

export function parseSGS(def: KPuzzleDefinition, sgs: string): SGSCachedData {
  const pieceOrdering: PieceRef[] = [];
  for (const line of sgs.split("\n")) {
    if (line.startsWith("SetOrder ")) {
      var lineTokens = line.split(" ");
      for (var j = 2; j < lineTokens.length; j++) {
        pieceOrdering.push({
          orbitName: lineTokens[1],
          permutationIdx: parseInt(lineTokens[j]),
        });
      }
    }
  }

  const remainingPiecesPerOrbit: Record<string, number> = {};
  for (const [orbitName, orbitDef] of Object.entries(def.orbits)) {
    remainingPiecesPerOrbit[orbitName] = orbitDef.numPieces;
  }

  function* algGenerator(): Generator<Alg> {
    for (const line of sgs.split("\n")) {
      if (line.startsWith("Alg ")) {
        yield Alg.fromString(line.substring(4));
      }
    }
  }
  const algs = algGenerator();

  function locatePiece(
    pieceRef: PieceRef,
    transformation: Transformation,
  ): PieceLocation {
    // TODO: optimize
    const inverse = invertTransformation(def, transformation);
    // const mod = def.orbits[pieceRef.orbitName].orientations;
    // function neg(amount: number): number {
    //   return (mod - amount) % mod;
    // }
    return {
      orbitName: pieceRef.orbitName,
      permutationIdx:
        inverse[pieceRef.orbitName].permutation[pieceRef.permutationIdx],
      orientation:
        inverse[pieceRef.orbitName].orientation[pieceRef.permutationIdx],
    };
  }

  const sgsCachedData: SGSCachedData = {
    ordering: [],
  };
  outer: for (const pieceRef of pieceOrdering) {
    const numAlgsToConsume =
      def.orbits[pieceRef.orbitName].orientations *
        remainingPiecesPerOrbit[pieceRef.orbitName]-- -
      1;
    const locations: SGSLocationInfo[][] = new Array(
      def.orbits[pieceRef.orbitName].numPieces,
    ).fill(null);
    // console.log(pieceRef, numAlgsToConsume);
    for (let i = 0; i < numAlgsToConsume; i++) {
      const next = algs.next();
      if (next.done) {
        if (i !== 0) {
          throw new Error("Ran out of algs partway through a piece.");
        }
        console.log("Skipping pieces starting with:", pieceRef);
        break outer;
      }
      const alg = next.value;
      const kpuzzle = new KPuzzle(def);
      kpuzzle.reset();
      // alg.log(def);
      kpuzzle.applyAlg(alg);
      const location = locatePiece(pieceRef, kpuzzle.state);
      locations[location.permutationIdx] ??= new Array(
        def.orbits[pieceRef.orbitName].orientations,
      ).fill(null);
      locations[location.permutationIdx][location.orientation] = {
        alg: alg.invert(),
        transformation: invertTransformation(def, kpuzzle.state),
      };
    }
    // Fill in the solved piece case.
    locations[pieceRef.permutationIdx][0] = {
      alg: new Alg(),
      transformation: identityTransformation(def),
    };
    sgsCachedData.ordering.push({
      pieceRef,
      inverseLocations: locations,
    });
  }
  return sgsCachedData;
}
