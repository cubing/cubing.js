import { Alg } from "../../../../../../alg";
// import type { Puzzle, State } from "cubing/dist/types/twisty"; // TODO
import {
  invertTransformation,
  KPuzzleDefinition,
  transformationOrder,
  Transformation,
} from "../../../../../../kpuzzle";
import { KSolvePuzzle, TreeAlgIndexer } from "../../../../../../twisty";
import type { SGSCachedData } from "./sgs";

type Puzzle = any; // TODO
type State = any; // TODO

const DEFAULT_STAGE1_DEPTH_LIMIT = 5; // For 2x2x2 demo.

function calculateMoves(puzzle: Puzzle, ksp: KSolvePuzzle) {
  /*
   *   Get a list of all moves; synthesize the multiples.
   */
  var moves: string[] = [];
  var movest: Transformation[] = [];
  (function () {
    Object.keys(puzzle.moves).forEach(function (mvname) {
      var o = transformationOrder(puzzle, puzzle.moves[mvname]);
      const tai = new TreeAlgIndexer(ksp, Alg.fromString(mvname));
      var st0 = tai.transformAtIndex(1) as Transformation;
      let stm: Transformation = st0;
      for (var i = 1; i < o; i++) {
        if (i === 1) {
          moves.push(mvname);
        } else if (i + 1 === o) {
          moves.push(mvname + "'");
        } else if (i + i <= o) {
          moves.push(mvname + i);
        } else {
          moves.push(mvname + (o - i) + "'");
        }
        movest.push(stm);
        stm = ksp.combine(stm, st0);
      }
    });
  })();
  return {
    moves,
    movest,
  };
}

function badRandomMoves(moves: string[], ksp: KSolvePuzzle): State {
  // var sum = 0;
  var scramble = "";
  for (var i = 0; i < 1000; i++) {
    scramble = scramble + " " + moves[Math.floor(moves.length * Math.random())];
  }
  // var sol = "";
  const indexer = new TreeAlgIndexer(ksp, Alg.fromString(scramble));
  return indexer.transformAtIndex(indexer.numMoves());
}

export class TrembleSolver {
  // private puzzle: KPuzzleDefinition;
  private ksp;
  private st;

  private baseorder: Array<any>; // TODO
  private esgs: Array<any>; // TODO

  private moves;
  private movest;

  constructor(private def: KPuzzleDefinition, sgs: SGSCachedData) {
    this.ksp = new KSolvePuzzle(this.def);
    this.st = this.ksp.identity();

    this.baseorder = sgs.baseorder;
    this.esgs = sgs.esgs;

    const movesInfo = calculateMoves(this.def, this.ksp);
    this.moves = movesInfo.moves;
    this.movest = movesInfo.movest;
  }

  public badRandomMoves(): State {
    return badRandomMoves(this.moves, this.ksp);
  }

  public async solve(
    state: State,
    stage1DepthLimit: number = DEFAULT_STAGE1_DEPTH_LIMIT,
  ): Promise<Alg> {
    console.log("tremble solve");
    let bestAlg: string | null = null;
    var best = 1000000;
    const recur = (st4: State, togo: number, sofar: string[]) => {
      console.log("recur");
      if (togo === 0) {
        var t = this.sgsPhaseSolve(st4);
        if (sofar.length + t[0] < best) {
          best = sofar.length + t[0];
          bestAlg = sofar.join(" ") + " " + t[1].join(" ");
          // console.log("New best " + best + " with prefix of " + sofar.length);
          // console.log(sofar.join(" ") + " " + t[1].join(" "));
        }
        return;
      }
      for (var m = 0; m < this.moves.length; m++) {
        sofar.push(this.moves[m]);
        recur(this.ksp.combine(st4, this.movest[m]), togo - 1, sofar);
        sofar.pop();
      }
    };
    for (var d = 0; d < stage1DepthLimit; d++) {
      recur(state, d, []);
    }
    if (bestAlg === null) {
      throw "No solution found!";
    }
    return Alg.fromString(bestAlg).simplify({ collapseMoves: true });
  }

  private sgsPhaseSolve(st4: State): [number, string[]] {
    var algos = [];
    var len = 0;
    for (var i = 0; i < this.baseorder.length; i++) {
      var set = this.baseorder[i][0];
      var ind = this.baseorder[i][1];
      debugger;
      if (
        st4[set].permutation[ind] !== this.st[set].permutation[ind] ||
        st4[set].orientation[ind] !== this.st[set].orientation[ind]
      ) {
        var st4i = invertTransformation(this.def, st4);
        var a =
          this.esgs[i][st4i[set].permutation[ind]][st4i[set].orientation[ind]];
        if (a === undefined) throw "Missing algorithm in sgs or esgs?";
        len = len + a[0].split(" ").length;
        algos.push(a[0]);
        st4 = this.ksp.combine(st4, a[1]);
        if (
          st4[set].permutation[ind] !== this.st[set].permutation[ind] ||
          st4[set].orientation[ind] !== this.st[set].orientation[ind]
        ) {
          console.log("Fail.");
        }
      }
    }
    return [len, algos];
  }
}
