import { Vector3 } from "three";
import { parse } from "../../src/alg";
import { TwistyPlayer } from "../../src/twisty";

document.querySelector("#alg")!.appendChild(
  new TwistyPlayer({
    alg: parse("R U R'"),
  }),
);

document.querySelector("#visualization")!.appendChild(
  new TwistyPlayer({
    visualization: "2D",
  }),
);

document.querySelector("#hint-facelets")!.appendChild(
  new TwistyPlayer({
    hintFacelets: "none",
  }),
);

document.querySelector("#experimental-stickering")!.appendChild(
  new TwistyPlayer({
    experimentalStickering: "PLL",
  }),
);

document.querySelector("#background")!.appendChild(
  new TwistyPlayer({
    background: "none",
  }),
);

document.querySelector("#controls")!.appendChild(
  new TwistyPlayer({
    controls: "none",
  }),
);

document.querySelector("#back-view")!.appendChild(
  new TwistyPlayer({
    backView: "side-by-side",
  }),
);

document.querySelector("#camera-position")!.appendChild(
  new TwistyPlayer({
    cameraPosition: new Vector3(-3, 4, 5),
  }),
);
