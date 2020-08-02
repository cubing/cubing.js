// import { Sequence } from "../../../alg";
// import { TreeAlgorithmIndexer } from "../../../twisty-old/cursor";
// import { MillisecondTimestamp } from "../Timeline";
// import { PuzzlePosition } from "./AlgCursor";

// import { KSolvePuzzle } from "../../../twisty-old/puzzle";
// import { KPuzzleDefinition } from "../../../kpuzzle";

// export class AlgIndexer {
//   private todoIndexer: TreeAlgorithmIndexer<KSolvePuzzle>;
//   // TODO: figure out whether to place timestamps in algs, or create an interface to wrap algs and move streams.
//   // eslint-disable-next-line @typescript-eslint/no-unused-vars-experimental
//   constructor(def: KPuzzleDefinition, alg: Sequence) {
//     const kp: KSolvePuzzle = new KSolvePuzzle(def);
//     this.todoIndexer = new TreeAlgorithmIndexer<KSolvePuzzle>(kp, alg);
//   }

//   // eslint-disable-next-line @typescript-eslint/no-unused-vars-experimental
//   getPosition(timestamp: MillisecondTimestamp): PuzzlePosition {
//     /*...*/
//     return { state: {}, movesInProgress: [] }; // TODO
//   }
// }
