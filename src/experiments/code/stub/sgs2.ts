import { Alg } from "../../../cubing/alg";
import {
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
    locations: SGSLocationInfo[][];
  }[];
  // pieceOrder: Array<[string, number]>;
  // esgs: Array<any>; // TODO/
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
    const mod = def.orbits[pieceRef.orbitName].orientations;
    function neg(amount: number): number {
      return (mod - amount) % mod;
    }
    return {
      orbitName: pieceRef.orbitName,
      permutationIdx:
        inverse[pieceRef.orbitName].permutation[pieceRef.permutationIdx],
      orientation: neg(
        inverse[pieceRef.orbitName].orientation[pieceRef.permutationIdx],
      ),
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
    );
    console.log(pieceRef, numAlgsToConsume);
    for (let i = 0; i < numAlgsToConsume; i++) {
      const next = algs.next();
      const alg = next.value;
      if (next.done) {
        if (i !== 0) {
          throw new Error("Ran out of algs partway through a piece.");
        }
        console.log("Skipping pieces starting with:", pieceRef);
        break outer;
      }
      const kpuzzle = new KPuzzle(def);
      kpuzzle.reset();
      // alg.log(def);
      kpuzzle.applyAlg(alg);
      const location = locatePiece(pieceRef, kpuzzle.state);
      locations[location.permutationIdx] ??= new Array(
        def.orbits[pieceRef.orbitName].orientations,
      );
      locations[location.permutationIdx][location.orientation] = {
        alg,
        transformation: kpuzzle.state,
      };
    }
    sgsCachedData.ordering.push({
      pieceRef,
      locations,
    });
  }

  console.log(sgsCachedData);

  // for (const line of sgs.split("\n")) {
  //   if (line.startsWith("Alg ")) {
  //     var alg = Alg.fromString(line.substring(4));
  //     const;
  //     //   var algo = Alg.fromString(salgo);
  //     //   const kpuzzle = new KPuzzle(def);
  //     //   kpuzzle.applyAlg(algo);
  //     //   const st = identityTransformation(def);
  //     //   const st2 = kpuzzle.state;
  //     //   var st2i = invertTransformation(def, st2);
  //     //   var loc = 0;
  //     //   while (loc < baseorder.length) {
  //     //     var set = baseorder[loc][0];
  //     //     var ind = baseorder[loc][1];
  //     //     console.log(
  //     //       ind,
  //     //       "asd",
  //     //       st[set].permutation[ind],
  //     //       st2[set].permutation[ind],
  //     //       st[set].orientation[ind],
  //     //       st2[set].orientation[ind],
  //     //       "st",
  //     //       JSON.stringify(st),
  //     //       JSON.stringify(st2),
  //     //       algo.toString(),
  //     //     );
  //     //     if (
  //     //       ind !== st2[set].permutation[ind] ||
  //     //       0 !== st2[set].orientation[ind]
  //     //     )
  //     //       break;
  //     //     loc++;
  //     //   }
  //     //   // console.log(st, st2, loc);
  //     //   var set = baseorder[loc][0];
  //     //   var ind = baseorder[loc][1];
  //     //   if (esgs[loc] === undefined) esgs[loc] = [];
  //     //   const l2 = st2i[set].permutation[ind];
  //     //   const l3 = st2i[set].orientation[ind];
  //     //   if (esgs[loc][l2] === undefined) esgs[loc][l2] = [];
  //     //   esgs[loc][l2][l3] = [algo.invert().toString(), st2i];
  //     //   console.log(loc, l2, l3);
  //     // } else if (line.length === 0) {
  //     //   // blank line
  //     // } else {
  //     //   throw new Error(`Bad line in sgs: ${line}`);
  //   }
  // }
  return sgsCachedData;
}
