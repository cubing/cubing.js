import { Alg, AlgBuilder, Move } from "../../../../../../alg";
import {
  areStatesEquivalent,
  combineTransformations,
  identityTransformation,
  invertTransformation,
  KPuzzle,
  KPuzzleDefinition,
  Transformation,
} from "../../../../../../kpuzzle";
import { countMoves } from "../../../../../../notation";
import type { SGSCachedData } from "./sgs";

const DEFAULT_STAGE1_DEPTH_LIMIT = 5; // For 2x2x2 demo.

function calculateMoves(def: KPuzzleDefinition): {
  move: Move;
  transformation: Transformation;
}[] {
  const searchMoves: {
    move: Move;
    transformation: Transformation;
  }[] = [];
  // const identity = identityTransformation(def); // TODO
  const kpuzzle = new KPuzzle(def);
  // TODO: Make it easy to filter moves.
  Object.keys(def.moves).forEach(function (moveName) {
    if (moveName.toLowerCase() === moveName) {
      console.log("Skipping move:", moveName);
      return;
    }

    const rootMove = new Move(moveName);
    if (rootMove.amount !== 1) {
      throw new Error(
        "SGS cannot handle def moves with an amount other than 1 yet.",
      );
    }
    kpuzzle.reset();
    for (let i = 1; true; i++) {
      kpuzzle.applyMove(rootMove);
      // console.log(kpuzzle.state, identityTransformation(def));
      if (
        // TODO: Use cached identity.
        areStatesEquivalent(def, kpuzzle.state, identityTransformation(def))
      ) {
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
    state: Transformation,
    stage1DepthLimit: number = DEFAULT_STAGE1_DEPTH_LIMIT,
  ): Promise<Alg> {
    let bestAlg: Alg | null = null;
    var bestLen = 1000000;
    const recur = (
      recursiveState: Transformation,
      togo: number,
      sofar: Alg,
    ) => {
      // console.log("recur");
      if (togo === 0) {
        const newAlg = sofar
          .concat(this.sgsPhaseSolve(recursiveState))
          .simplify({ collapseMoves: true });

        const len = countMoves(newAlg);
        if (bestAlg === null || len < bestLen) {
          console.log(`New best (${len} moves): ${newAlg.toString()}`);
          bestAlg = newAlg;
          bestLen = len;
        }
        return;
      }
      for (const searchMove of this.searchMoves) {
        recur(
          combineTransformations(
            this.def,
            recursiveState,
            searchMove.transformation,
          ),
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

  private sgsPhaseSolve(initialState: Transformation): Alg {
    // const pieceNames = "UFR URB UBL ULF DRF DFL DLB DBR".split(" ");

    // function loggo(s: string) {
    //   // console.warn(s);
    //   // document.body.appendChild(document.createElement("div")).textContent = s;
    // }

    // console.log("sgsPhaseSolve");
    const algBuilder = new AlgBuilder();
    let state = initialState;

    for (const piece of this.sgs.ordering) {
      const orbitName = piece.pieceRef.orbitName;
      const permutationIdx = piece.pieceRef.permutationIdx;
      // loggo(
      //   `Solving piece #${piece.pieceRef.permutationIdx} (${pieceNames[permutationIdx]})`,
      // );

      const inverseState = invertTransformation(this.def, state);
      // console.log(
      //   piece.pieceRef,
      //   JSON.stringify(initialState),
      //   JSON.stringify(inverseState),
      // );
      // console.log(
      //   piece.inverseLocations,
      //   orbitName,
      //   permutationIdx,
      //   inverseState[orbitName],
      //   inverseState[orbitName].permutation,
      //   inverseState[orbitName].permutation[permutationIdx],
      //   piece.inverseLocations[
      //     inverseState[orbitName].permutation[permutationIdx]
      //   ],
      //   inverseState[orbitName].orientation[permutationIdx],
      // );

      // loggo(
      //   `In the inverse, the location for piece #${
      //     piece.pieceRef.permutationIdx
      //   } (${pieceNames[permutationIdx]}) is occupied by piece #${
      //     inverseState[orbitName].permutation[permutationIdx]
      //   } (${
      //     pieceNames[inverseState[orbitName].permutation[permutationIdx]]
      //   }) oriented ${
      //     inverseState[orbitName].orientation[permutationIdx]
      //   }× clockwise.`,
      // );

      // const player1 = new TwistyPlayer({
      //   puzzle: "2x2x2",
      //   background: "none",
      // });
      // player1.experimentalSetStartStateOverride(
      //   JSON.parse(JSON.stringify(inverseState)),
      // );
      // document.body.appendChild(player1);

      const info =
        piece.inverseLocations[
          inverseState[orbitName].permutation[permutationIdx]
        ][inverseState[orbitName].orientation[permutationIdx]];
      // console.log(info);
      if (!info) {
        throw new Error("Missing algorithm in sgs or esgs?");
      }

      algBuilder.experimentalPushAlg(info.alg);
      state = combineTransformations(this.def, state, info.transformation);
      // console.log(state, permutationIdx);

      // loggo(`This is solved by ${info.alg.toString()}`);

      // const player = new TwistyPlayer({
      //   puzzle: "2x2x2",
      //   alg: algBuilder.toAlg(),
      // });
      // player.experimentalSetStartStateOverride(
      //   JSON.parse(JSON.stringify(initialState)),
      // );
      // document.body.appendChild(player);
      if (
        state[orbitName].permutation[permutationIdx] !== permutationIdx ||
        state[orbitName].orientation[permutationIdx] !== 0
      ) {
        throw new Error("bad SGS :-(");
      }
    }

    return algBuilder.toAlg();
  }
}
