import { Alg } from "../../../../../../alg";
import {
  identityTransformation,
  invertTransformation,
  KPuzzle,
  KPuzzleDefinition,
  Transformation,
} from "../../../../../../kpuzzle";

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
        pieceOrdering[parseInt(lineTokens[j]) - 1] = {
          orbitName: lineTokens[1],
          permutationIdx: j - 2,
        };
      }
    }
  }

  console.log(pieceOrdering);

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
  for (const pieceRef of pieceOrdering) {
    const inverseLocations: SGSLocationInfo[][] = new Array(
      def.orbits[pieceRef.orbitName].numPieces,
    ).fill(null);
    sgsCachedData.ordering.push({
      pieceRef,
      inverseLocations: inverseLocations,
    });

    // Fill in the solved piece case.
    inverseLocations[pieceRef.permutationIdx][0] = {
      alg: new Alg(),
      transformation: identityTransformation(def),
    };
  }
  // console.log(pieceRef, numAlgsToConsume);

  outer: for (const alg of algs) {
    const kpuzzle = new KPuzzle(def);
    kpuzzle.reset();
    alg.log("def");
    kpuzzle.applyAlg(alg);
    for (const { pieceRef, inverseLocations } of sgsCachedData.ordering) {
      function isSolvedPiece(state: Transformation, pieceRef: PieceRef) {
        return (
          state[pieceRef.orbitName].permutation[pieceRef.permutationIdx] ===
            pieceRef.permutationIdx &&
          state[pieceRef.orbitName].orientation[pieceRef.permutationIdx] === 0
        );
      }
      if (!isSolvedPiece(kpuzzle.state, pieceRef)) {
        const location = locatePiece(pieceRef, kpuzzle.state);
        inverseLocations[location.permutationIdx] ??= new Array(
          def.orbits[pieceRef.orbitName].orientations,
        ).fill(null);
        inverseLocations[location.permutationIdx][location.orientation] = {
          alg: alg.invert(),
          transformation: invertTransformation(def, kpuzzle.state),
        };
        continue outer;
      }
    }
  }
  return sgsCachedData;
}
