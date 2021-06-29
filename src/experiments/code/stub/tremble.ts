import { Alg, AlgBuilder, Move } from "../../../cubing/alg";
import {
  areStatesEquivalent,
  combineTransformations,
  identityTransformation,
  invertTransformation,
  KPuzzle,
  KPuzzleDefinition,
  Transformation,
} from "../../../cubing/kpuzzle";
import { countMoves } from "../../../cubing/notation";
import type { KSolvePuzzleState } from "../../../cubing/twisty/3D/puzzles/KPuzzleWrapper";
import type { SGSCachedData } from "./sgs2";

const DEFAULT_STAGE1_DEPTH_LIMIT = 4; // For 2x2x2 demo.

function calculateMoves(def: KPuzzleDefinition): {
  move: Move;
  transformation: Transformation;
}[] {
  const searchMoves: {
    move: Move;
    transformation: Transformation;
  }[] = [];
  const id = identityTransformation(def);
  const kpuzzle = new KPuzzle(def);
  Object.keys(def.moves).forEach(function (moveName) {
    const rootMove = new Move(moveName);
    if (rootMove.amount !== 1) {
      throw new Error(
        "SGS cannot handle def moves with an amount other than 1 yet.",
      );
    }
    kpuzzle.reset();
    for (let i = 1; true; i++) {
      kpuzzle.applyMove(rootMove);
      if (areStatesEquivalent(def, kpuzzle.state, id)) {
        break;
      }
      searchMoves.push({
        move: rootMove.modified({ amount: i }),
        transformation: kpuzzle.state, // TODO: make this safe through the KPuzzle API
      });
    }
  });
  return searchMoves;
}

// function badRandomMoves(moves: string[], ksp: KSolvePuzzle): KSolvePuzzleState {
//   // var sum = 0;
//   var scramble = "";
//   for (var i = 0; i < 1000; i++) {
//     scramble = scramble + " " + moves[Math.floor(moves.length * Math.random())];
//   }
//   // var sol = "";
//   const indexer = new TreeAlgIndexer(ksp, Alg.fromString(scramble));
//   return indexer.transformAtIndex(indexer.numMoves()) as any; // TODO
// }

export class TrembleSolver {
  private searchMoves: {
    move: Move;
    transformation: Transformation;
  }[];

  constructor(private def: KPuzzleDefinition, private sgs: SGSCachedData) {
    this.searchMoves = calculateMoves(this.def);
  }

  // public badRandomMoves(): KSolvePuzzleState {
  //   return badRandomMoves(this.moves, this.ksp);
  // }

  public async solve(
    state: KSolvePuzzleState,
    stage1DepthLimit: number = DEFAULT_STAGE1_DEPTH_LIMIT,
  ): Promise<Alg> {
    console.log("solve");
    let bestAlg: Alg | null = null;
    var bestLen = 1000000;
    const recur = (st4: KSolvePuzzleState, togo: number, sofar: Alg) => {
      console.log("recur");
      if (togo === 0) {
        const newAlg = sofar
          .concat(this.sgsPhaseSolve(st4))
          .simplify({ collapseMoves: true });

        const len = countMoves(newAlg);
        if (bestAlg === null || len < bestLen) {
          bestAlg = newAlg;
          bestLen = len;
        }
        return;
      }
      for (const searchMove of this.searchMoves) {
        recur(
          combineTransformations(this.def, st4, searchMove.transformation),
          togo - 1,
          sofar.concat([searchMove.move]),
        );
      }
    };
    for (var d = 0; d < stage1DepthLimit; d++) {
      recur(state, d, new Alg());
    }
    if (bestAlg === null) {
      throw new Error("SGS search failed.");
    }
    return bestAlg;
  }

  private sgsPhaseSolve(st4: KSolvePuzzleState): Alg {
    const algBuilder = new AlgBuilder();
    let state = st4;

    for (const piece of this.sgs.ordering) {
      const orbitName = piece.pieceRef.orbitName;
      const permutationIdx = piece.pieceRef.permutationIdx;
      const st4i = invertTransformation(this.def, st4);
      const info =
        piece.locations[st4i[orbitName].permutation[permutationIdx]][
          st4i[orbitName].orientation[permutationIdx]
        ];
      if (!info) {
        throw new Error("Missing algorithm in sgs or esgs?");
      }
      algBuilder.experimentalPushAlg(info.alg);
      state = combineTransformations(this.def, state, info.transformation);

      if (
        st4[orbitName].permutation[permutationIdx] !== permutationIdx ||
        st4[orbitName].orientation[permutationIdx] !== 0
      ) {
        console.log("Fail.");
      }
    }

    return algBuilder.toAlg();
  }
}
