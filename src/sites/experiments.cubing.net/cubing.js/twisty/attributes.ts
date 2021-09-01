import { Alg } from "../../../../cubing/alg";
import { useNewFaceNames } from "../../../../cubing/puzzle-geometry";
import {
  experimentalSetShareAllNewRenderers,
  TwistyPlayerV1,
} from "../../../../cubing/twisty";

useNewFaceNames(true);
experimentalSetShareAllNewRenderers(true);

{
  document.querySelector("#no-attributes")!.appendChild(new TwistyPlayerV1());
}

{
  document.querySelector("#alg")!.appendChild(
    new TwistyPlayerV1({
      alg: "R U R' U R U2' R'",
    }),
  );
  const tw = new TwistyPlayerV1();
  document.querySelector("#alg")!.appendChild(tw);
  tw.alg = new Alg("R U R' U R U2' R'");
}

{
  document.querySelector("#experimental-setup-alg")!.appendChild(
    new TwistyPlayerV1({
      experimentalSetupAlg: "L' U R U' L U R'",
    }),
  );
  const tw = new TwistyPlayerV1();
  document.querySelector("#experimental-setup-alg")!.appendChild(tw);
  tw.experimentalSetupAlg = new Alg("L' U R U' L U R'");
}

{
  document.querySelector("#experimental-setup-anchor")!.appendChild(
    new TwistyPlayerV1({
      alg: "R U R' U R U2' R'",
      experimentalSetupAnchor: "end",
    }),
  );
  const tw = new TwistyPlayerV1({
    alg: "R U R' U R U2' R'",
  });
  document.querySelector("#experimental-setup-anchor")!.appendChild(tw);
  tw.experimentalSetupAnchor = "end";
}

{
  document.querySelector("#puzzle")!.appendChild(
    new TwistyPlayerV1({
      alg: "R U R' U R U2' R'",
      puzzle: "fto",
    }),
  );
  const tw = new TwistyPlayerV1();
  document.querySelector("#puzzle")!.appendChild(tw);
  tw.alg = new Alg("R U R' U R U2' R'");
  tw.puzzle = "fto";
}

{
  document.querySelector("#visualization")!.appendChild(
    new TwistyPlayerV1({
      alg: "R U R' U R U2' R'",
      visualization: "2D",
    }),
  );
  const tw = new TwistyPlayerV1();
  document.querySelector("#visualization")!.appendChild(tw);
  tw.alg = new Alg("R U R' U R U2' R'");
  tw.visualization = "2D";
}

{
  document.querySelector("#hint-facelets")!.appendChild(
    new TwistyPlayerV1({
      alg: "R U R' U R U2' R'",
      hintFacelets: "none",
    }),
  );
  const tw = new TwistyPlayerV1();
  document.querySelector("#hint-facelets")!.appendChild(tw);
  tw.alg = new Alg("R U R' U R U2' R'");
  tw.hintFacelets = "none";
}

{
  document.querySelector("#experimental-stickering")!.appendChild(
    new TwistyPlayerV1({
      alg: "R U R' U R U2' R'",
      experimentalStickering: "OLL",
    }),
  );
  const tw = new TwistyPlayerV1();
  document.querySelector("#experimental-stickering")!.appendChild(tw);
  tw.alg = new Alg("R U R' U R U2' R'");
  tw.experimentalStickering = "OLL";
}

{
  document.querySelector("#background")!.appendChild(
    new TwistyPlayerV1({
      alg: "R U R' U R U2' R'",
      background: "none",
    }),
  );
  const tw = new TwistyPlayerV1();
  document.querySelector("#background")!.appendChild(tw);
  tw.alg = new Alg("R U R' U R U2' R'");
  tw.background = "none";
}

{
  document.querySelector("#control-panel")!.appendChild(
    new TwistyPlayerV1({
      alg: "R U R' U R U2' R'",
      controlPanel: "none",
    }),
  );
  const tw = new TwistyPlayerV1();
  document.querySelector("#control-panel")!.appendChild(tw);
  tw.alg = new Alg("R U R' U R U2' R'");
  tw.controlPanel = "none";
}

{
  document.querySelector("#back-view")!.appendChild(
    new TwistyPlayerV1({
      alg: "R U R' U R U2' R'",
      backView: "side-by-side",
    }),
  );
  const tw = new TwistyPlayerV1();
  document.querySelector("#back-view")!.appendChild(tw);
  tw.alg = new Alg("R U R' U R U2' R'");
  tw.backView = "side-by-side";
}

{
  document.querySelector("#experimental-camera-latitude")!.appendChild(
    new TwistyPlayerV1({
      alg: "R U R' U R U2' R'",
      experimentalCameraLatitude: 0,
    }),
  );
  const tw = new TwistyPlayerV1();
  document.querySelector("#experimental-camera-latitude")!.appendChild(tw);
  tw.alg = new Alg("R U R' U R U2' R'");
  tw.experimentalCameraLatitude = 0;
}

{
  document.querySelector("#experimental-camera-longitude")!.appendChild(
    new TwistyPlayerV1({
      alg: "R U R' U R U2' R'",
      experimentalCameraLongitude: 0,
    }),
  );
  const tw = new TwistyPlayerV1();
  document.querySelector("#experimental-camera-longitude")!.appendChild(tw);
  tw.alg = new Alg("R U R' U R U2' R'");
  tw.experimentalCameraLongitude = 0;
}

{
  document.querySelector("#experimental-camera-latitude-limits")!.appendChild(
    new TwistyPlayerV1({
      alg: "R U R' U R U2' R'",
      experimentalCameraLatitudeLimits: "none",
      experimentalCameraLatitude: 80,
    }),
  );
  const tw = new TwistyPlayerV1();
  document
    .querySelector("#experimental-camera-latitude-limits")!
    .appendChild(tw);
  tw.alg = new Alg("R U R' U R U2' R'");
  tw.experimentalCameraLatitudeLimits = "none";
  tw.experimentalCameraLatitude = 80;
}

{
  document.querySelector("#viewer-link")!.appendChild(
    new TwistyPlayerV1({
      alg: "R U R' U R U2' R'",
      viewerLink: "none",
    }),
  );
  const tw = new TwistyPlayerV1();
  document.querySelector("#viewer-link")!.appendChild(tw);
  tw.alg = new Alg("R U R' U R U2' R'");
  tw.viewerLink = "none";
}

{
  document.querySelector("#multiple-attributes")!.appendChild(
    new TwistyPlayerV1({
      alg: "R U R' U R U2' R'",
      experimentalSetupAnchor: "end",
      experimentalStickering: "OLL",
      background: "none",
      controlPanel: "none",
    }),
  );
  const tw = new TwistyPlayerV1();
  document.querySelector("#multiple-attributes")!.appendChild(tw);
  tw.alg = new Alg("R U R' U R U2' R'");
  tw.experimentalSetupAnchor = "end";
  tw.experimentalStickering = "OLL";
  tw.background = "none";
  tw.controlPanel = "none";
}
