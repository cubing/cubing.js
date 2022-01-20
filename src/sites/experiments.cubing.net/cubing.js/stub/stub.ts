// Stub file for testing.
// Feel free to add code here if you need a quick place to run some code, but avoid committing any changes.

import { Alg } from "../../../../cubing/alg";
import { KPuzzle, KPuzzleDefinition } from "../../../../cubing/kpuzzle";
import { experimentalCountQuantumMoves } from "../../../../cubing/notation";

const twelveZeros = new Array(12).fill(0);

const def: KPuzzleDefinition = {
  name: "topsy-turvy",
  orbits: { main: { numPieces: 12, numOrientations: 1 } },
  startStateData: {
    main: {
      pieces: twelveZeros.map((_, i) => i),
      orientation: twelveZeros,
    },
  },
  moves: {
    L: {
      main: {
        permutation: [10, 8, 6, 4, 2, 0, 1, 3, 5, 7, 9, 11],
        orientation: twelveZeros,
      },
    },
    R: {
      main: {
        permutation: [1, 3, 5, 7, 9, 11, 10, 8, 6, 4, 2, 0],
        orientation: twelveZeros,
      },
    },
  },
};

const kpuzzle = new KPuzzle(def);

const A = new Alg("R9 L R");
const B = new Alg("R9 L2 R L R4");
const C = A.concat(new Alg("L3 R7"));

for (const alg of [A, B, C]) {
  alg.log();
  const transformation = kpuzzle.algToTransformation(alg);
  console.log("Quantum moves:", experimentalCountQuantumMoves(alg));
  console.log("Order:", transformation.repetitionOrder());
  console.log(
    "Permutation",
    transformation.transformationData["main"].permutation,
  );
}

// const A = kpuzzle.algToTransformation("R9 L R");
// console.log(A.transformationData);
// const B = kpuzzle.algToTransformation("(R9 L R)2 L R4");
// console.log(B.transformationData);
// const C = kpuzzle.algToTransformation("(R9 L R) L3 R7");
// console.log(C.transformationData);
// const D = kpuzzle.algToTransformation("((R9 L R)2 L R4)3 ");
// console.log(C.transformationData);
