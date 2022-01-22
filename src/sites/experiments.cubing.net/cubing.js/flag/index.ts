// import { Alg } from "../../../../cubing/alg";
// // Stub file for testing.
// // Feel free to add code here if you need a quick place to run some code, but avoid committing any changes.
// import { puzzles } from "../../../../cubing/puzzles";
// import { Cube3D } from "../../../../cubing/twisty";
// import { Twisty3DScene } from "../../../../cubing/twisty/views/3D/Twisty3DScene";
// import { AlgCursor } from "../../../../cubing/twisty/old/animation/cursor/AlgCursor";
// import { Timeline } from "../../../../cubing/twisty/old/animation/Timeline";
// import { TwistyScrubber } from "../../../../cubing/twisty/old/dom/controls/TwistyScrubber";

// const TRANSLATE_SCALE = 1.1;
// const WOBBLE = 0.2;

// const scene = new Twisty3DScene();
// const canvas = null as any; // TODO
// //   new Twisty3DVantage(scene, {
// //   orbitCoordinates: {
// //     latitude: 90,
// //     longitude: 0,
// //     distance: 24,
// //   },
// // });
// canvas.camera.position.y = 24;
// canvas.camera.far = 100; // Document this for others.
// canvas.experimentalSetLatitudeLimits("none");
// document.body.appendChild(canvas);

// function randomChoice<T>(l: T[]): T {
//   return l[Math.floor(Math.random() * l.length)];
// }

// (async () => {
//   const def = await puzzles["3x3x3"].def();

//   const timeline = new Timeline();
//   timeline.tempoScale = 4;

//   function addCube3D(x: number, z: number, s: string, baked: boolean = false) {
//     let algStr = "";
//     if (baked) {
//       algStr = s;
//     } else {
//       for (let i = 0; i < 2; i++) {
//         algStr += randomChoice([
//           " ",
//           " [U': R' U' F' R U R' U' R' F R2 U' R' U' R U R' U R]",
//         ]);
//         algStr += randomChoice([
//           " ",
//           " [x U': R' U' F' R U R' U' R' F R2 U' R' U' R U R' U R]",
//         ]);
//         algStr += randomChoice([
//           " ",
//           " [z2 U': R' U' F' R U R' U' R' F R2 U' R' U' R U R' U R]",
//         ]);
//         algStr += randomChoice([
//           " ",
//           " [x U': R' U' F' R U R' U' R' F R2 U' R' U' R U R' U R]",
//         ]);
//         algStr += randomChoice([
//           " ",
//           " R2 U R U R' U' R' U' R' U R'",
//           " (R2 U R U R' U' R' U' R' U R')2",
//         ]);
//         algStr += randomChoice(["", " S2 U2 S2 U2"]);
//       }
//       algStr += " " + s;
//       algStr += randomChoice([" ", " D", " D2", " D'"]);
//       algStr += randomChoice([" ", " E", " E2", " E'"]);
//     }

//     const cursor = new AlgCursor(timeline, def, Alg.fromString(algStr));
//     timeline.addCursor(cursor);
//     const cube3D = new Cube3D(def, cursor, scene.scheduleRender.bind(scene), {
//       hintFacelets: "none",
//     });

//     // cube3D.onPositionChange({
//     //   state: kpuzzle.state,
//     //   movesInProgress: [],
//     // });
//     cube3D.translateX(x * TRANSLATE_SCALE);
//     cube3D.translateZ(z * TRANSLATE_SCALE);
//     cube3D.rotateX((Math.random() - 1 / 2) * WOBBLE);
//     cube3D.rotateZ((Math.random() - 1 / 2) * WOBBLE);
//     scene.addTwisty3DPuzzle(cube3D);

//     return algStr;
//   }

//   const blue = "x'";
//   const bww = "L";
//   const vbbw = "r' U'";
//   const vbww = "R' U'";
//   const vwbb = "r' U";
//   const vwwb = "R' U";
//   const grid = [
//     [blue, bww, blue, "L F' r' F", vbbw, vbbw, vbbw, vbbw, vbbw],
//     [vbww, "f L f'", vbww, "B r' B' L' D L", vwbb, vwbb, vwbb, vwbb, vwbb],
//     [blue, bww, blue, "R' U F L F'", vwwb, vwwb, vwwb, vwwb, vwwb],
//     [vbww, "f L f'", vbww, vbww, vbww, vbww, vbww, vbww, vbww],
//     [vbbw, vbbw, vbbw, vbbw, vbbw, vbbw, vbbw, vbbw, vbbw],
//     [vwbb, vwbb, vwbb, vwbb, vwbb, vwbb, vwbb, vwbb, vwbb],
//   ];
//   const algs: string[][] = [];

//   const baked = [
//     [
//       "D2' F L2' R2' U2' F' U2' B2' F' L2' B' L R F2' U2' M",
//       "D L2' B2' U' B2' D' R2' D L2' D' L2' B2' L' U B2' U B2' U' R2'",
//       "U2' B2' D F2' D' R2' U2' B2' L2' U L2' F2' L' U L D' L' U' R' M",
//       "L F' L' U R' L M",
//       "F2' R2' U' R2' B2' U' L2' D R2' D2' B2' U2' L' B' F' L R' F' L2' D2' M",
//       "D' F2' L2' R2' U' L2' D L2' B2' U R2' U L B' F' L R M",
//       "L2' B2' U' R2' U' L2' U B2' U' L2' F2' U2' R' B U' F' R U' L' F U' M",
//       "L2' U L2' F2' U' B2' R2' F2' D2' F2' D R' D2' B F L R' F' R2' M",
//       "L D2' L B2' D2' L' D2' F2' R' F2' D2' L2' B' L F' R2' F R' M",
//     ],
//     [
//       "B2' F2' U' L2' U2' F2' L2' D' U' R2' U2' R2' L' D' F2' L D' B2'",
//       "L2' D' F2' D' B2' U' R2' B2' U L2' U' F' D F L2' D2'",
//       "B U B' R' U' F' D2' B L2' B D2' F2' D2' B L2' B D2'",
//       "B' L2' D2' F2' D2' R U2' B2' F2' L' B2' U2' L' U' L D F2' U' F' L2' r'",
//       "L F B U2' R' L U2' R2' U2' F2' D2' L2' B2' M",
//       "L2' B' D2' R2' U2' B2' U2' R2' B2' L2' B R B D2' L' B2' M",
//       "L2' D' F2' D B2' R2' U2' B2' R2' D' R2' D' L' B F L R' F R2' M",
//       "F' L2' R' D2' L2' U2' F2' U2' R' U2' R' F2' U2' F' L' R' B R2' F L M",
//       "L2' F2' D2' U' R2' D L2' B2' R2' D2' F2' U' R' B R2' U' B2' R' D B M",
//     ],
//     [
//       "D' L2' D F2' D' B2' R2' D' B2' U F2' D2' F L2' R' U B' U' B L' M",
//       "R' F2' L U2' L2' U2' F2' R' D2' R2' F2' R D' U F2' L2' U'",
//       "F2' D2' R2' B2' L2' U' B2' U' R2' U F R' F D' F2' D2' F L M",
//       "F2' D R2' D' R2' U R2' U' R2' F2' U' R' U F L F' D2'",
//       "R' U D2' R2' F2' L U2' B2' L' F2' R D2' B2' R",
//       "R2' U' B2' L2' F2' D B2' R2' F2' U2' R D' U",
//       "U2' F2' R2' U' B2' U' F2' U B2' U' F2' U2' R' F2' D' F2' D R2' D'",
//       "F L2' B D2' L2' R2' B' R2' F R2' U2' F' R D U L2' D2'",
//       "U' B2' D2' B2' L2' U F2' U F2' U2' L2' U R' U",
//     ],
//     [
//       "L2' B2' U' B2' D L2' D' L2' U L2' U' R' U'",
//       "D2' B D B U' B2' D' B2' D' L2' D' L2' D2' B2'",
//       "D2' B2' F2' L2' U' L2' U' R2' D L2' B2' L2' R D' R B2' R' U'",
//       "D2' F2' R2' D2' U F2' U2' B2' L2' U F2' D' L F2' U L' U B2' U'",
//       "D2' F2' R2' U2' L B2' L' B2' U2' R2' F2' R2' D' B2' D R U' L2'",
//       "D R2' U' R2' D2' L2' F2' D' L2' D F2' D R' D' U' L2'",
//       "D' R2' B2' U2' L2' U' B2' R' U' R2' U' B2' U B2'",
//       "D2' R2' F2' D B2' U' L2' U' F2' R2' D2' R2' L D' L2' D' B2' D F2'",
//       "L' D2' B2' R L D B2' U2' R2' U B2' D2' L2' U' R2' L2' U2'",
//     ],
//     [
//       "F2' L2' F2' L2' D F2' U' L2' B2' U' B2' D' L F' R B2' R' B' L' R' M",
//       "L2' B2' D' B2' F2' D R2' U' L2' D2' B2' U' L' F L' R U' L2' D2' U' M",
//       "D' F2' L2' R2' U' L2' D L2' B2' U R2' U L B' F' R2' F2' L R' M",
//       "F2' B' U F2' U' B L' B' F2' L2' B2' R' B2' R' D2' L' D2' F2' M",
//       "U L2' D B2' D' L2' F2' U R2' U' F2' U' L' B' F2' L R' M",
//       "R2' U' B2' L2' F2' D B2' R2' F2' U2' R2' L' B' F L R' M",
//       "F U2' F' L' B U2' R B2' L' D2' R2' L' U2' B2' U2' L' F2' M",
//       "B2' L' D2' R D2' R' B2' D2' B2' D2' F2' R B' D' F D L D R M",
//       "B2' L' D2' R B2' R' B2' L' B2' R2' F2' R B' F L R F' M",
//     ],
//     [
//       "L U2' R' U2' R B2' D2' R2' U2' L' D2' R' B' U' F' U2' B U B' L R' M",
//       "U2' L2' B U2' F2' L2' B' U2' F' L2' R2' D2' L B F2' L F L2' R F' M",
//       "F2' D' B2' F2' D2' F2' R2' B2' D' F2' L' B F L' R' M",
//       "L2' U' R2' B2' R2' D2' L2' D F2' D' U2' L' B F L R' F R2' M",
//       "B2' D2' B2' F2' U2' F2' L' B L R' M",
//       "L2' B2' U' B2' D L2' D' L2' U L2' U' L' B F2' L R' M",
//       "D' B2' U2' B2' L2' D' B2' U B2' D2' F2' L B R' D2' L D2' M",
//       "U R2' U' L2' U' F2' D2' L2' F2' U B2' U' L F' R B2' R' B F2' L R M",
//       "L2' R2' U2' B L2' D2' F' L2' B U2' R2' L' F R D2' F D2' L' M",
//     ],
//   ];

//   for (let i = 0; i < grid.length; i++) {
//     const algRow: string[] = [];
//     algs.push(algRow);
//     for (let j = 0; j < grid[0].length; j++) {
//       algRow.push(addCube3D(j - 4, i - 2.5, baked[i][j], true));
//     }
//   }

//   scene.scheduleRender();
//   const scrubber = new TwistyScrubber(timeline);
//   document.body.appendChild(scrubber);

//   const panel = new TwistyControlButtonPanel(timeline, {
//     fullscreenElement: canvas,
//   });
//   document.body.appendChild(panel);

//   setTimeout(() => {
//     timeline.play();
//   }, 1500);

//   const button = document.body.appendChild(document.createElement("button"));
//   button.textContent = "Screenshot";
//   button.addEventListener("click", () => {
//     const url = canvas.renderToDataURL();
//     const a = document.createElement("a");
//     a.href = url;
//     a.download = "flag.png";
//     a.click();
//   });
// })();
