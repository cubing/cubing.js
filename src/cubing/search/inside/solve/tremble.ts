import { Alg, AlgBuilder, Move, QuantumMove } from "../../../alg";
import {
  areStatesEquivalent,
  combineTransformations,
  identityTransformation,
  invertTransformation,
  KPuzzle,
  KPuzzleDefinition,
  Transformation,
} from "../../../kpuzzle";
import { countMoves } from "../../../notation";
import type { SGSAction, SGSCachedData } from "./parseSGS";
import { randomChoiceFactory } from "./vendor/random-uint-below";

const DEFAULT_STAGE1_DEPTH_LIMIT = 2; // Moderately performant default.

const DOUBLECHECK_PLACED_PIECES = true;
const DEBUG = false;

// TODO: Take moves instead of move names?
function calculateMoves(
  def: KPuzzleDefinition,
  moveNames: string[],
): {
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
  moveNames.forEach(function (moveName) {
    const rootMove = new Move(moveName);
    if (rootMove.amount !== 1) {
      throw new Error(
        "SGS cannot handle def moves with an amount other than 1 yet.",
      );
    }
    kpuzzle.reset();
    // eslint-disable-next-line no-constant-condition
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

  constructor(
    private def: KPuzzleDefinition,
    private sgs: SGSCachedData,
    trembleMoveNames?: string[],
  ) {
    this.searchMoves = calculateMoves(
      this.def,
      trembleMoveNames ?? Object.keys(this.def.moves),
    );
  }

  // public badRandomMoves(): KSolvePuzzleState {
  //   return badRandomMoves(this.moves, this.ksp);
  // }

  public async solve(
    state: Transformation,
    stage1DepthLimit: number = DEFAULT_STAGE1_DEPTH_LIMIT,
    quantumMoveOrder?: (quantumMove: QuantumMove) => number,
  ): Promise<Alg> {
    let bestAlg: Alg | null = null;
    let bestLen = 1000000;
    const recur = (
      recursiveState: Transformation,
      togo: number,
      sofar: Alg,
    ) => {
      // console.log("recur");
      if (togo === 0) {
        const sgsAlg = this.sgsPhaseSolve(recursiveState, bestLen);
        if (!sgsAlg) {
          return;
        }
        // console.log("sgs done!", sofar.toString(), "|", sgsAlg.toString());
        const newAlg = sofar
          .concat(sgsAlg)
          .simplify({ collapseMoves: true, quantumMoveOrder });

        const len = countMoves(newAlg);
        if (bestAlg === null || len < bestLen) {
          if (DEBUG) {
            console.log(`New best (${len} moves): ${newAlg.toString()}`);
            console.log(`Tremble moves are: ${sofar.toString()}`);
          }
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
    for (let d = 0; d <= stage1DepthLimit; d++) {
      recur(state, d, new Alg());
    }
    if (bestAlg === null) {
      throw new Error("SGS search failed.");
    }
    return bestAlg;
  }

  private sgsPhaseSolve(
    initialState: Transformation,
    bestLenSofar: number,
  ): Alg | null {
    // const pieceNames = "UFR URB UBL ULF DRF DFL DLB DBR".split(" ");

    // function loggo(s: string) {
    //   // console.warn(s);
    //   // document.body.appendChild(document.createElement("div")).textContent = s;
    // }

    // console.log("sgsPhaseSolve");
    const algBuilder = new AlgBuilder();
    let state = initialState;
    for (const step of this.sgs.ordering) {
      const cubieSeq = step.pieceOrdering;
      let key = "";
      const inverseState = invertTransformation(this.def, state);
      for (let i = 0; i < cubieSeq.length; i++) {
        const loc = cubieSeq[i];
        const orbitName = loc.orbitName;
        const idx = loc.permutationIdx;
        key += ` ${inverseState[orbitName].permutation[idx]} ${inverseState[orbitName].orientation[idx]}`;
      }
      const info = step.lookup[key];
      if (!info) {
        throw new Error("Missing algorithm in sgs or esgs?");
      }
      algBuilder.experimentalPushAlg(info.alg);
      if (algBuilder.experimentalNumUnits() >= bestLenSofar) {
        return null;
      }
      state = combineTransformations(this.def, state, info.transformation);
      if (DOUBLECHECK_PLACED_PIECES) {
        for (let i = 0; i < cubieSeq.length; i++) {
          const location = cubieSeq[i];
          const orbitName = location.orbitName;
          const idx = location.permutationIdx;
          if (
            state[orbitName].permutation[idx] !== idx ||
            state[orbitName].orientation[idx] !== 0
          ) {
            throw new Error("bad SGS :-(");
          }
        }
      }
    }
    return algBuilder.toAlg();
  }
}

export async function randomStateFromSGS(
  def: KPuzzleDefinition,
  sgs: SGSCachedData,
): Promise<Transformation> {
  const randomChoice = await randomChoiceFactory<SGSAction>(); // TODO: make this sync by putting the factory into a TLA

  let state = identityTransformation(def);
  for (const step of sgs.ordering) {
    const sgsAction = randomChoice(Object.values(step.lookup));
    state = combineTransformations(def, state, sgsAction.transformation);
  }
  return state;
}
