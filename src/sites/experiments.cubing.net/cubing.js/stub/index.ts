// Stub file for testing.
// Feel free to add code here if you need a quick place to run some code, but avoid committing any changes.

import { Twisty3DProp } from "../../../../cubing/twisty/dom/twisty-player-model/props/depth-6/Twisty3DProp";
import { TwistyPlayerModel } from "../../../../cubing/twisty/dom/twisty-player-model/props/TwistyPlayerModel";

// Note: this file needs to contain code to avoid a Snowpack error.
// So we put a `console.log` here for now.
console.log("Loading stub file.");

(async () => {
  const model = new TwistyPlayerModel();

  model.timeRangeProp.addListener(async () => {
    const timeRange = await model.timeRangeProp.get();
    console.log("timeRange", timeRange);
  });

  let cachedConstructorProxy: Promise<
    typeof import("../../../../cubing/twisty/dom/twisty-player-model/props/depth-6/3d-proxy")
  > | null = null;
  async function constructorProxy(): Promise<
    typeof import("../../../../cubing/twisty/dom/twisty-player-model/props/depth-6/3d-proxy")
  > {
    return (cachedConstructorProxy ??= import(
      "../../../../cubing/twisty/dom/twisty-player-model/props/depth-6/3d-proxy"
    ));
  }

  const scene = new (await constructorProxy()).Twisty3DScene();
  const canvas = new (await constructorProxy()).Twisty3DCanvas(scene);
  const div = document.body.appendChild(document.createElement("div"));
  div.setAttribute("style", "width: 256px; height: 256px;");
  div.appendChild(canvas.canvas);
  canvas.canvas.setAttribute("style", "width: 256px; height: 256px;");

  model.puzzle = "gigaminx";

  const twisty3D = new Twisty3DProp({ puzzleID: model.puzzleProp });
  scene.add(await twisty3D.get());

  model.setup = "F2";

  model.positionProp.addListener(async () => {
    (await twisty3D.get()).onPositionChange(await model.positionProp.get());
    scene.scheduleRender();
  });

  model.algProp.set(
    "(BL2 B2' DL2' B' BL' B' DL2' BL2 B' BL2' B2 BL DL2 B' DL BL B' BL2 DR2 U' (F2 FR2' D2 FR L2' 1-4BR 1-4R2' U)5 F2 FR2' D2 FR L2' 1-4BR 1-4R2' U2 2DR2 u2' 1-3R2 1-3BR' l2 fr' d2' fr2 f2' (u' 1-3R2 1-3BR' l2 fr' d2' fr2 f2')5 u dr2' bl2' b bl' dl' b dl2' bl' b2' bl2 b bl2' dl2 b bl b dl2 b2 bl2')2",
  );
  model.timestamp = 500;

  const input = document.body.appendChild(document.createElement("input"));
  input.setAttribute("style", "width: 100%;");
  input.type = "range";
  input.min = (await model.timeRangeProp.get()).start.toString();
  input.max = (await model.timeRangeProp.get()).end.toString();

  var isMouseDown = false;

  document.addEventListener(
    "mousedown",
    function (event) {
      if (event.which) isMouseDown = true;
    },
    true,
  );

  document.addEventListener(
    "mouseup",
    function (event) {
      if (event.which) isMouseDown = false;
    },
    true,
  );

  // var x = 0;
  var y = 0;
  let clickNum = 0;

  document.addEventListener(
    "mousedown",
    () => {
      clickNum++;
    },
    false,
  );

  document.addEventListener("mousemove", onMouseUpdate, false);
  document.addEventListener("mouseenter", onMouseUpdate, false);

  function onMouseUpdate(e: MouseEvent) {
    // x = e.pageX;
    y = e.pageY;
    // console.log(x, y);
  }

  let lastVal = parseInt(input.value);
  let lastPreval = parseInt(input.value);
  let scaling: boolean = false;
  let currentClickNum = 0;
  input.addEventListener("input", (e: Event) => {
    if (scaling) {
      return;
    }
    if (isMouseDown) {
      const rect = input.getBoundingClientRect();
      const sliderY = rect.top + rect.height / 2;
      console.log(sliderY, e, y, isMouseDown);

      const yDist = Math.abs(sliderY - y);
      let scale = 1;
      if (yDist > 64) {
        scale = Math.max(Math.pow(2, -(yDist - 64) / 64), 1 / 32);
      }
      const preVal = parseInt(input.value);
      console.log("cl", currentClickNum, clickNum, preVal);
      if (currentClickNum === clickNum) {
        const delta = (preVal - lastPreval) * scale;
        console.log("delta", delta, yDist);
        scaling = true;
        let newVal = preVal;
        newVal =
          lastVal +
          delta * scale +
          (preVal - lastVal) *
            Math.min(1, Math.pow(1 / 2, (yDist * yDist) / 64));
        input.value = newVal.toString();
        console.log(scale);
        scaling = false;
      } else {
        currentClickNum = clickNum;
        input.value = (parseInt(input.value) - 20000).toString();
      }
      lastPreval = preVal;
    }

    const val = parseInt(input.value);
    lastVal = val;
    model.timestamp = val;
    scene.scheduleRender();
  });

  scene.scheduleRender();
})();
