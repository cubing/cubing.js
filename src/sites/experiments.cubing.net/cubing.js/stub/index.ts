// Stub file for testing.
// Feel free to add code here if you need a quick place to run some code, but avoid committing any changes.

import { AlgProp } from "../../../../cubing/twisty/dom/twisty-player-model/depth-1/AlgProp";
import { IndexerConstructorProp } from "../../../../cubing/twisty/dom/twisty-player-model/depth-1/IndexerConstructorProp";
import { PuzzleProp } from "../../../../cubing/twisty/dom/twisty-player-model/depth-1/PuzzleProp";
import { TimestampProp } from "../../../../cubing/twisty/dom/twisty-player-model/depth-1/TimestampProp";
import { PuzzleDefProp } from "../../../../cubing/twisty/dom/twisty-player-model/depth-2/PuzzleDefProp";
import { PuzzleAlgProp } from "../../../../cubing/twisty/dom/twisty-player-model/depth-3/PuzzleAlgProp";
import { AlgTransformationProp } from "../../../../cubing/twisty/dom/twisty-player-model/depth-4/AlgTransformationProp";
import { IndexerProp } from "../../../../cubing/twisty/dom/twisty-player-model/depth-4/IndexerProp";
import { PositionProp } from "../../../../cubing/twisty/dom/twisty-player-model/depth-5/PositionProp";
import { TimeRangeProp } from "../../../../cubing/twisty/dom/twisty-player-model/depth-5/TimeRangeProp";
import { Twisty3DProp } from "../../../../cubing/twisty/dom/twisty-player-model/depth-6/Twisty3DProp";
import {
  SimpleTwistyPropSource,
  TwistyPropDerived,
} from "../../../../cubing/twisty/dom/twisty-player-model/TwistyProp";

// Note: this file needs to contain code to avoid a Snowpack error.
// So we put a `console.log` here for now.
console.log("Loading stub file.");

(async () => {
  class A extends SimpleTwistyPropSource<number> {
    getDefaultValue: () => 4;
  }

  class B extends TwistyPropDerived<{ a: number }, number> {
    async derive(input: { a: number }): Promise<number> {
      await new Promise(async (resolve) =>
        setTimeout(resolve, Math.random() * 100),
      );
      return (input.a * 2) % 17;
    }
  }

  class C extends TwistyPropDerived<{ a: number }, number> {
    async derive(input: { a: number }): Promise<number> {
      await new Promise(async (resolve) =>
        setTimeout(resolve, Math.random() * 10),
      );
      return (input.a * 3) % 17;
    }
  }

  class D extends TwistyPropDerived<{ b: number; c: number }, boolean> {
    derive(input: { b: number; c: number }): boolean {
      return input.b > input.c;
    }
  }

  const a = new A(2);
  const b = new B({ a });
  const c = new C({ a });
  const d = new D({ b, c });

  async function f() {
    console.log(await a.get(), await b.get(), await c.get(), await d.get());
    a.set(6);
    console.log(await a.get(), await b.get(), await c.get(), await d.get());
    a.set(8);
    console.log(await a.get(), await b.get(), await c.get(), await d.get());
    for (let i = 0; i < 17; i++) {
      a.set(i);
      console.log(await a.get(), await d.get());
    }

    for (let i = 0; i < 17; i++) {
      a.set(i);
      d.get().then(async (dv) => console.log(i, await a.get(), dv));
      await new Promise(async (resolve) =>
        setTimeout(resolve, Math.random() * 5),
      );
    }
  }
  if (false) {
    f();
  }

  const algProp = new AlgProp();
  const setupProp = new AlgProp();
  const puzzleProp = new PuzzleProp();
  const puzzleDefProp = new PuzzleDefProp({ puzzle: puzzleProp });
  const puzzleAlgProp = new PuzzleAlgProp({
    algWithIssues: algProp,
    puzzleDef: puzzleDefProp,
  });
  const puzzleSetupProp = new PuzzleAlgProp({
    algWithIssues: setupProp,
    puzzleDef: puzzleDefProp,
  });

  const indexerConstructor = new IndexerConstructorProp();
  const indexerProp = new IndexerProp({
    indexerConstructor: indexerConstructor,
    algWithIssues: puzzleAlgProp,
    def: puzzleDefProp,
  });

  const timestampProp = new TimestampProp();

  const setupTransformationProp = new AlgTransformationProp({
    alg: puzzleSetupProp,
    def: puzzleDefProp,
  });

  const positionProp = new PositionProp({
    setupTransformation: setupTransformationProp,
    indexer: indexerProp,
    timestamp: timestampProp,
    def: puzzleDefProp,
  });

  const timeRangeProp = new TimeRangeProp({ indexer: indexerProp });

  timeRangeProp.addListener(async () => {
    const timeRange = await timeRangeProp.get();
    console.log("timeRange", timeRange);
  });

  let cachedConstructorProxy: Promise<
    typeof import("../../../../cubing/twisty/dom/twisty-player-model/depth-6/3d-proxy")
  > | null = null;
  async function constructorProxy(): Promise<
    typeof import("../../../../cubing/twisty/dom/twisty-player-model/depth-6/3d-proxy")
  > {
    return (cachedConstructorProxy ??= import(
      "../../../../cubing/twisty/dom/twisty-player-model/depth-6/3d-proxy"
    ));
  }

  const scene = new (await constructorProxy()).Twisty3DScene();
  const canvas = new (await constructorProxy()).Twisty3DCanvas(scene);
  const div = document.body.appendChild(document.createElement("div"));
  div.setAttribute("style", "width: 256px; height: 256px;");
  div.appendChild(canvas.canvas);
  canvas.canvas.setAttribute("style", "width: 256px; height: 256px;");

  puzzleProp.set("gigaminx");

  const twisty3D = new Twisty3DProp({ puzzleID: puzzleProp });
  scene.add(await twisty3D.get());

  setupProp.set("F2");

  positionProp.addListener(async () => {
    (await twisty3D.get()).onPositionChange(await positionProp.get());
    scene.scheduleRender();
  });

  algProp.set(
    "BL2 B2' DL2' B' BL' B' DL2' BL2 B' BL2' B2 BL DL2 B' DL BL B' BL2 DR2 U' (F2 FR2' D2 FR L2' 1-4BR 1-4R2' U)5 F2 FR2' D2 FR L2' 1-4BR 1-4R2' U2 2DR2 u2' 1-3R2 1-3BR' l2 fr' d2' fr2 f2' (u' 1-3R2 1-3BR' l2 fr' d2' fr2 f2')5 u dr2' bl2' b bl' dl' b dl2' bl' b2' bl2 b bl2' dl2 b bl b dl2 b2 bl2'",
  );
  timestampProp.set(500);

  const input = document.body.appendChild(document.createElement("input"));
  input.type = "range";
  input.min = (await timeRangeProp.get()).start.toString();
  input.max = (await timeRangeProp.get()).end.toString();

  input.addEventListener("input", () => {
    timestampProp.set(parseFloat(input.value));
    scene.scheduleRender();
  });

  scene.scheduleRender();

  // new Twisty3DWrapper()

  // algProp.set("U D");
  // console.log("a1", (await indexerProp.get()).algDuration());
  // algProp.set("(U D)");
  // console.log("a2", (await indexerProp.get()).algDuration());
  // indexerConstructor.set("simultaneous");
  // const g = indexerProp.get();
  // console.log("a4", (await indexerProp.get()).algDuration());
  // algProp.set("(U D E2)");
  // console.log("a5", (await g).algDuration());

  // indexerConstructor.set("tree");
  // console.log("a6", (await indexerProp.get()).algDuration());

  // setupProp.set("R U R' U' R' F R2 U' R' U' R U R' F'");
  // console.log(JSON.stringify(await positionProp.get(), null, "  "));
  // algProp.set("R U R' U' R' F R2 U' R' U' R U R' F'");
  // timestampProp.set(14200);
  // console.log(JSON.stringify(await positionProp.get(), null, "  "));

  // algProp.set("(U D)");
  // console.log("foo");
  // indexerConstructor.set("simultaneous");

  // // (await puzzleAlgProp.get()).alg.log();
  // // puzzleAlgProp.addListener(console.log);

  // algProp.set("R U R'");
  // (await algProp.get()).alg.log(0);
  // (async () => {
  //   const g = puzzleAlgProp.get();
  //   await new Promise(async (resolve) =>
  //     setTimeout(resolve, Math.random() * 100),
  //   );
  //   (await g).alg.log(1);
  // })();
  // algProp.set("F2");
  // (await algProp.get()).alg.log();
  // (async () => {
  //   const g = puzzleAlgProp.get();
  //   await new Promise(async (resolve) =>
  //     setTimeout(resolve, Math.random() * 100),
  //   );
  //   (await g).alg.log(2);
  // })();
  // algProp.set("L2");
  // (async () => {
  //   const g = await puzzleAlgProp.get();
  //   (await g).alg.log(3);
  // })();
  // algProp.set("R++");
  // (async () => {
  //   const g = await puzzleAlgProp.get();
  //   console.log(4, await g);
  // })();
  // puzzleProp.set("megaminx");
  // (async () => {
  //   const g = await puzzleAlgProp.get();
  //   (await g).alg.log(5);
  // })();
  // puzzleProp.set("clock");
  // (async () => {
  //   const g = await puzzleAlgProp.get();
  //   (await g).alg.log(6);
  // })();
  // algProp.set("UR1+");
  // (async () => {
  //   const g = await puzzleAlgProp.get();
  //   (await g).alg.log(7);
  // })();
})();
