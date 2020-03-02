import { Example } from "../alg";
import { Cursor } from "./cursor";

// describe("applyBlockMove()", () => {
//   it("should be able to apply a block move", () => {
//     const p = new KPuzzle(Puzzles["3x3x3"]);
//     p.applyBlockMove(new BlockMove("R", 6));
//     expect(p.serialize()).to.equal("CORNERS\n7 1 2 4 3 5 6 0\n0 0 0 0 0 0 0 0\nEDGES\n0 1 2 11 7 5 6 4 8 9 10 3\n0 0 0 0 0 0 0 0 0 0 0 0");
//   });
// });

describe("Durations", () => {
  it("should calculate the duration of a Sune", () => {
    expect(new Cursor.AlgDuration(Cursor.DefaultDurationForAmount).traverse(Example.Sune)).toBe(7500);
  });
});

// "use strict";

// // Hacky, yet effective.
// function twistyTest(description: string, condition: boolean) {
//   var li = document.createElement("li");
//   if (condition) {
//     console.log("\u2705 " + description);
//     li.textContent = "\u2705 " + description;
//   } else {
//     console.error("\u274C " + description);
//     li.textContent = "\u274C " + description;
//   }
//   document.write(new XMLSerializer().serializeToString(li));
// }

// // (function TestSimpleBreakpoints() {
// //   var b1 = new Twisty.Timeline.SimpleBreakpoints([30, 400, 1500, 2000]);
// //   twistyTest("First breakpoint", b1.firstBreakpoint() === 30);
// //   twistyTest("Last breakpoint", b1.lastBreakpoint() === 2000);
// //   twistyTest("Forwards from beginning", b1.breakpoint(Twisty.Cursor.Direction.Forwards, Twisty.Timeline.BreakpointType.Move, 30) === 400);
// //   twistyTest("Forwards from first breakpoint", b1.breakpoint(Twisty.Cursor.Direction.Forwards, Twisty.Timeline.BreakpointType.Move, 400) === 1500);
// //   twistyTest("Forwards between breakpoints", b1.breakpoint(Twisty.Cursor.Direction.Forwards, Twisty.Timeline.BreakpointType.Move, 600) === 1500);
// //   twistyTest("Backwards from first breakpoint", b1.breakpoint(Twisty.Cursor.Direction.Backwards, Twisty.Timeline.BreakpointType.Move, 400) === 30);
// //   twistyTest("Backwards from just before end", b1.breakpoint(Twisty.Cursor.Direction.Backwards, Twisty.Timeline.BreakpointType.Move, 1999) === 1500);
// //   twistyTest("Backwards from end", b1.breakpoint(Twisty.Cursor.Direction.Backwards, Twisty.Timeline.BreakpointType.Move, 2000) === 1500);
// // })();

// (function TestDurations() {
//   console.log(new Twisty.Cursor.AlgDuration(Twisty.Cursor.DefaultDurationForAmount).traverse(Alg.Example.Sune));
//   // twistyTest("First breakpoint", new AlgDuration(DefaultDurationForAmount).traverse(Alg.Example.Sune));
// })();

// // console.log(
// //   ,
// //   new AlgDuration(ConstantDurationForAmount).traverse(Alg.Example.Sune)
// // );

// function positionEqual<P extends Twisty.Puzzle>(puz: P, c: Twisty.Cursor<P>, ts: Twisty.Cursor.Duration, expected: Twisty.Cursor.Position<P>) {
//   try {
//     if (c.currentTimestamp() !== ts) {
//       return false;
//     }

//     var pos = c.currentPosition();
//     if (!puz.equivalent(expected.state, pos.state)) {
//       return false;
//     }
//     if (pos.moves.length !== expected.moves.length) {
//       return false;
//     }
//     if (expected.moves.length === 0) {
//       return true;
//     }
//     for (var i = 0; i < expected.moves.length; i++) {
//       // TODO: Semantic comparison?
//       if (expected.moves[i].direction !== pos.moves[i].direction) {
//         return false;
//       }

//       var expectedMove = expected.moves[i].move;
//       var actualMove = pos.moves[i].move;

//       if (expectedMove.type != "blockMove")) {
//         return false;
//       }
//       if (actualMove.type != "blockMove")) {
//         return false;
//       }

//       if (expectedMove.base !== actualMove.base) {
//         return false;
//       }
//       if (expectedMove.amount !== actualMove.amount) {
//         return false;
//       }
//     }
//     return true;
//   } catch(e) {
//     console.error(e);
//     return false;
//   }
// }

// (function TestCursorValues() {

//   var puz = Twisty.KSolvePuzzle.fromID("3x3x3");
//   var a = new Alg.Sequence([
//     new Alg.Conjugate(
//       new Alg.BlockMove("R", 1),
//       new Alg.BlockMove("U", 2),
//       1
//     ),
//     new Alg.BlockMove("U", -1),
//     new Alg.Conjugate(
//       new Alg.BlockMove("R", 1),
//       new Alg.BlockMove("U", -1),
//       1
//     )
//   ])
//   var c = new Twisty.Cursor<Twisty.KSolvePuzzle>(a, puz);
//   // twistyTest("initial", positionEqual(puz, c, 1, {"state": {"value": 0},"moves": []}));
//   twistyTest("initial state", positionEqual(puz, c, 0, {
//       "state": {"CORNERS":{"permutation":[1,2,3,4,5,6,7,8],"orientation":[0,0,0,0,0,0,0,0]},"EDGES":{"permutation":[1,2,3,4,5,6,7,8,9,10,11,12],"orientation":[0,0,0,0,0,0,0,0,0,0,0,0]}},
//       "moves": [
//   ]}));
//   c.forward(300, false);
//   twistyTest("forward from start of single move", positionEqual(puz, c, 300, {
//       "state": {"CORNERS":{"permutation":[1,2,3,4,5,6,7,8],"orientation":[0,0,0,0,0,0,0,0]},"EDGES":{"permutation":[1,2,3,4,5,6,7,8,9,10,11,12],"orientation":[0,0,0,0,0,0,0,0,0,0,0,0]}},
//       "moves": [{
//         "move": new Alg.BlockMove("R", 1),
//         "direction": Twisty.Cursor.Direction.Forwards,
//         "fraction": 0.6
//   }]}));
//   c.forward(1900, false);
//   twistyTest("forward across two moves", positionEqual(puz, c, 2200, {
//       "state": {"CORNERS":{"permutation":[5,2,3,1,8,6,7,4],"orientation":[1,0,0,2,2,0,0,1]},"EDGES":{"permutation":[1,2,3,5,12,6,7,4,9,10,11,8],"orientation":[0,0,0,1,1,0,0,1,0,0,0,1]}},
//       "moves": [{
//         "move": new Alg.BlockMove("U", 2),
//         "direction": Twisty.Cursor.Direction.Forwards,
//         "fraction": 0.6
//   }]}));
//   c.forward(123, false);
//   twistyTest("forward within second move", positionEqual(puz, c, 2323, {
//       "state": {"CORNERS":{"permutation":[5,2,3,1,8,6,7,4],"orientation":[1,0,0,2,2,0,0,1]},"EDGES":{"permutation":[1,2,3,5,12,6,7,4,9,10,11,8],"orientation":[0,0,0,1,1,0,0,1,0,0,0,1]}},
//       "moves": [{
//         "move": new Alg.BlockMove("U", 2),
//         "direction": Twisty.Cursor.Direction.Forwards,
//         "fraction": 0.882
//   }]}));
//   c.forward(2345, false);
//   twistyTest("forward across more than 2 moves", positionEqual(puz, c, 4668, {
//       "state": {"CORNERS":{"permutation":[1,5,4,2,3,6,7,8],"orientation":[2,1,0,1,2,0,0,0]},"EDGES":{"permutation":[5,1,4,3,2,6,7,8,9,10,11,12],"orientation":[1,0,0,0,1,0,0,0,0,0,0,0]}},
//       "moves": [{
//         "move": new Alg.BlockMove("R", 1),
//         "direction": Twisty.Cursor.Direction.Forwards,
//         "fraction": 0.168
//   }]}));
//   c.forward(832, false);
//   twistyTest("forward exact amount to end of move", positionEqual(puz, c, 5500, {
//       "state": {"CORNERS":{"permutation":[3,5,4,1,8,6,7,2],"orientation":[0,1,0,1,2,0,0,2]},"EDGES":{"permutation":[5,1,4,2,12,6,7,3,9,10,11,8],"orientation":[1,0,0,0,1,0,0,1,0,0,0,1]}},
//       "moves": [
//   ]}));
//   c.forward(1000, false);
//   twistyTest("forward exact amount of full move", positionEqual(puz, c, 6500, {
//       "state": {"CORNERS":{"permutation":[5,4,1,3,8,6,7,2],"orientation":[1,0,1,0,2,0,0,2]},"EDGES":{"permutation":[1,4,2,5,12,6,7,3,9,10,11,8],"orientation":[0,0,0,1,1,0,0,1,0,0,0,1]}},
//       "moves": [
//   ]}));
//   c.forward(100000, false);
//   twistyTest("forward to end", positionEqual(puz, c, 7500, {
//       "state": {"CORNERS":{"permutation":[3,4,1,2,5,6,7,8],"orientation":[1,0,1,1,0,0,0,0]},"EDGES":{"permutation":[1,4,2,3,5,6,7,8,9,10,11,12],"orientation":[0,0,0,0,0,0,0,0,0,0,0,0]}},
//       "moves": [
//   ]}));
//   c.forward(1500, false);
//   twistyTest("try to go past end", positionEqual(puz, c, 7500, {
//       "state": {"CORNERS":{"permutation":[3,4,1,2,5,6,7,8],"orientation":[1,0,1,1,0,0,0,0]},"EDGES":{"permutation":[1,4,2,3,5,6,7,8,9,10,11,12],"orientation":[0,0,0,0,0,0,0,0,0,0,0,0]}},
//       "moves": [
//   ]}));

//   c.backward(7500, false);
//   twistyTest("backwards across entire alg", positionEqual(puz, c, 0, {
//       "state": {"CORNERS":{"permutation":[1,2,3,4,5,6,7,8],"orientation":[0,0,0,0,0,0,0,0]},"EDGES":{"permutation":[1,2,3,4,5,6,7,8,9,10,11,12],"orientation":[0,0,0,0,0,0,0,0,0,0,0,0]}},
//       "moves": [
//   ]}));
//   c.forward(7500, false);
//   twistyTest("forwards across entire alg", positionEqual(puz, c, 7500, {
//       "state": {"CORNERS":{"permutation":[3,4,1,2,5,6,7,8],"orientation":[1,0,1,1,0,0,0,0]},"EDGES":{"permutation":[1,4,2,3,5,6,7,8,9,10,11,12],"orientation":[0,0,0,0,0,0,0,0,0,0,0,0]}},
//       "moves": [
//   ]}));

//   c.backward(10000, false);
//   twistyTest("overshooting backwards across entire alg", positionEqual(puz, c, 0, {
//       "state": {"CORNERS":{"permutation":[1,2,3,4,5,6,7,8],"orientation":[0,0,0,0,0,0,0,0]},"EDGES":{"permutation":[1,2,3,4,5,6,7,8,9,10,11,12],"orientation":[0,0,0,0,0,0,0,0,0,0,0,0]}},
//       "moves": [
//   ]}));
//   c.forward(10000, false);
//   twistyTest("overshooting forwards across entire alg", positionEqual(puz, c, 7500, {
//       "state": {"CORNERS":{"permutation":[3,4,1,2,5,6,7,8],"orientation":[1,0,1,1,0,0,0,0]},"EDGES":{"permutation":[1,4,2,3,5,6,7,8,9,10,11,12],"orientation":[0,0,0,0,0,0,0,0,0,0,0,0]}},
//       "moves": [
//   ]}));

//   c.backward(300, false);
//   twistyTest("backward from end of single move", positionEqual(puz, c, 7200, {
//       "state": {"CORNERS":{"permutation":[5,4,1,3,8,6,7,2],"orientation":[1,0,1,0,2,0,0,2]},"EDGES":{"permutation":[1,4,2,5,12,6,7,3,9,10,11,8],"orientation":[0,0,0,1,1,0,0,1,0,0,0,1]}},
//       "moves": [{
//         "move": new Alg.BlockMove("R", -1),
//         "direction": Twisty.Cursor.Direction.Forwards,
//         "fraction": 0.7
//   }]}));
//   c.backward(1400, false);
//   twistyTest("backward across two moves", positionEqual(puz, c, 5800, {
//       "state": {"CORNERS":{"permutation":[3,5,4,1,8,6,7,2],"orientation":[0,1,0,1,2,0,0,2]},"EDGES":{"permutation":[5,1,4,2,12,6,7,3,9,10,11,8],"orientation":[1,0,0,0,1,0,0,1,0,0,0,1]}},
//       "moves": [{
//         "move": new Alg.BlockMove("U", -1),
//         "direction": Twisty.Cursor.Direction.Forwards,
//         "fraction": 0.3
//   }]}));
//   c.backward(123, false);
//   twistyTest("backward within second-to-last move", positionEqual(puz, c, 5677, {
//       "state": {"CORNERS":{"permutation":[3,5,4,1,8,6,7,2],"orientation":[0,1,0,1,2,0,0,2]},"EDGES":{"permutation":[5,1,4,2,12,6,7,3,9,10,11,8],"orientation":[1,0,0,0,1,0,0,1,0,0,0,1]}},
//       "moves": [{
//         "move": new Alg.BlockMove("U", -1),
//         "direction": Twisty.Cursor.Direction.Forwards,
//         "fraction": 0.177
//   }]}));
//   c.backward(2345, false);
//   twistyTest("backward across more than 2 moves", positionEqual(puz, c, 3332, {
//       "state": {"CORNERS":{"permutation":[3,1,5,2,8,6,7,4],"orientation":[0,2,1,0,2,0,0,1]},"EDGES":{"permutation":[3,5,1,2,12,6,7,4,9,10,11,8],"orientation":[0,1,0,0,1,0,0,1,0,0,0,1]}},
//       "moves": [{
//         "move": new Alg.BlockMove("R", -1),
//         "direction": Twisty.Cursor.Direction.Forwards,
//         "fraction": 0.832
//   }]}));
//   c.backward(832, false);
//   twistyTest("backward exact amount to end of move", positionEqual(puz, c, 2500, {
//       "state": {"CORNERS":{"permutation":[3,1,5,2,8,6,7,4],"orientation":[0,2,1,0,2,0,0,1]},"EDGES":{"permutation":[3,5,1,2,12,6,7,4,9,10,11,8],"orientation":[0,1,0,0,1,0,0,1,0,0,0,1]}},
//       "moves": [
//   ]}));
//   c.backward(1500, false);
//   twistyTest("backward exact amount of full move", positionEqual(puz, c, 1000, {
//       "state": {"CORNERS":{"permutation":[5,2,3,1,8,6,7,4],"orientation":[1,0,0,2,2,0,0,1]},"EDGES":{"permutation":[1,2,3,5,12,6,7,4,9,10,11,8],"orientation":[0,0,0,1,1,0,0,1,0,0,0,1]}},
//       "moves": [
//   ]}));
//   c.backward(100000, false);
//   twistyTest("backward to end", positionEqual(puz, c, 0, {
//       "state": {"CORNERS":{"permutation":[1,2,3,4,5,6,7,8],"orientation":[0,0,0,0,0,0,0,0]},"EDGES":{"permutation":[1,2,3,4,5,6,7,8,9,10,11,12],"orientation":[0,0,0,0,0,0,0,0,0,0,0,0]}},
//       "moves": [
//   ]}));
//   c.backward(1500, false);
//   twistyTest("try to go past end", positionEqual(puz, c, 0, {
//       "state": {"CORNERS":{"permutation":[1,2,3,4,5,6,7,8],"orientation":[0,0,0,0,0,0,0,0]},"EDGES":{"permutation":[1,2,3,4,5,6,7,8,9,10,11,12],"orientation":[0,0,0,0,0,0,0,0,0,0,0,0]}},
//       "moves": [
//   ]}));

//   // c.backward(500, false);
//   // console.log(c.currentTimestamp(), JSON.stringify(c.currentPosition()));

//   // c.backward(800, false);
//   // console.log(c.currentTimestamp(), JSON.stringify(c.currentPosition()));

//   // c.backward(700, false);
//   // console.log(c.currentTimestamp(), JSON.stringify(c.currentPosition()));
//   // twistyTest("backward", positionEqual(puz, c, 1, {
//   //     "state": {"value": 8},
//   //     "moves": [
//   // ]}));
// })();
