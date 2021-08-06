// Stub file for testing.
// Feel free to add code here if you need a quick place to run some code, but avoid committing any changes.

import {
  TwistyPropV2,
  TwistySourceProp,
} from "../../../../cubing/twisty/dom/twisty-player-model/ManagedSource";

// Note: this file needs to contain code to avoid a Snowpack error.
// So we put a `console.log` here for now.
console.log("Loading stub file.");

class A extends TwistySourceProp<number> {
  defaultValue: 4;
}

class B extends TwistyPropV2<{ a: number }, number> {
  async derive(input: { a: number }): Promise<number> {
    await new Promise(async (resolve) =>
      setTimeout(resolve, Math.random() * 100),
    );
    return (input.a * 2) % 17;
  }
}

class C extends TwistyPropV2<{ a: number }, number> {
  async derive(input: { a: number }): Promise<number> {
    await new Promise(async (resolve) =>
      setTimeout(resolve, Math.random() * 100),
    );
    return (input.a * 3) % 17;
  }
}

class D extends TwistyPropV2<{ b: number; c: number }, boolean> {
  async derive(input: { b: number; c: number }): Promise<boolean> {
    await new Promise(async (resolve) =>
      setTimeout(resolve, Math.random() * 100),
    );
    return input.b > input.c;
  }
}

const a = new A();
const b = new B({ a });
const c = new C({ a });
const d = new D({ b, c });

console.log(await a.get(), await b.get(), await c.get(), await d.get());

// const timeoutInput = document.body.appendChild(
//   document.createElement("input"),
// ) as HTMLInputElement;
// timeoutInput.type = "number";
// timeoutInput.value = "200";
// timeoutInput.step = "25";

// const model = new TwistyPlayerModel();

// console.log(model);
// model.algProp.alg = new Alg("R U R'");
// // model.puzzleProp.puzzleID = "skewb";

// console.log(model.puzzleProp.puzzleLoader);
// (async () => {
//   model.algProp.setFromString("sdfdfsdf'sdfdsf");
//   (await model.algIssues()).log();

//   model.algProp.setFromString("R  F");
//   (await model.algIssues()).log();

//   model.algProp.setFromString("notamove");
//   (await model.algIssues()).log();

//   model.algProp.setFromString("R++");
//   (await model.algIssues()).log();

//   // model.puzzleProp.puzzleID = "megaminx";
//   (await model.algIssues()).log();

//   console.log(model.visualizationProp.wrapperElement);
//   document.body.appendChild(model.visualizationProp.wrapperElement);

//   model.requestedVisualization = "3D";
//   // model.requestedVisualization = "2D";
//   model.requestedVisualization = "3D";
//   model.alg = "U2 D2";

//   model.alg = "L U2 D F";
//   model.puzzle = "3x3x3";
//   model.puzzle = "pyraminx";
//   model.setup = "R2 U R U R' U' R' U' R' U R'";

//   (window as any).model = model;

//   async function update() {
//     const randomChoice = await randomChoiceFactory<PuzzleID>();
//     // TODO: 3x3x3 only works the first time.
//     let puzzle = model.puzzle;
//     while (puzzle === model.puzzle) {
//       model.puzzle = randomChoice([
//         "3x3x3",
//         "megaminx",
//         "pyraminx",
//         "master_tetraminx",
//         "7x7x7",
//       ]);
//     }
//     console.log("model.puzzle", model.puzzle);
//     setTimeout(update, parseInt(timeoutInput.value));
//   }
//   if (false) {
//     update();
//   }
// })();
