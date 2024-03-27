import { Alg } from "../../../../cubing/alg";
import { TwistyPlayer } from "../../../../cubing/twisty";

document.querySelector("#no-attributes")!.appendChild(new TwistyPlayer());

{
  document.querySelector("#alg")!.appendChild(
    new TwistyPlayer({
      alg: "R U R' U R U2' R'",
    }),
  );
  const tw = new TwistyPlayer();
  document.querySelector("#alg")!.appendChild(tw);
  tw.alg = new Alg("R U R' U R U2' R'");
}

{
  document.querySelector("#experimental-setup-alg")!.appendChild(
    new TwistyPlayer({
      experimentalSetupAlg: "L' U R U' L U R'",
    }),
  );
  const tw = new TwistyPlayer();
  document.querySelector("#experimental-setup-alg")!.appendChild(tw);
  tw.experimentalSetupAlg = new Alg("L' U R U' L U R'");
}

{
  document.querySelector("#experimental-setup-anchor")!.appendChild(
    new TwistyPlayer({
      alg: "R U R' U R U2' R'",
      experimentalSetupAnchor: "end",
    }),
  );
  const tw = new TwistyPlayer({
    alg: "R U R' U R U2' R'",
  });
  document.querySelector("#experimental-setup-anchor")!.appendChild(tw);
  tw.experimentalSetupAnchor = "end";
}

{
  document.querySelector("#puzzle")!.appendChild(
    new TwistyPlayer({
      alg: "R U R' U R U2' R'",
      puzzle: "fto",
    }),
  );
  const tw = new TwistyPlayer();
  document.querySelector("#puzzle")!.appendChild(tw);
  tw.alg = new Alg("R U R' U R U2' R'");
  tw.puzzle = "fto";
}

{
  document.querySelector("#visualization")!.appendChild(
    new TwistyPlayer({
      alg: "R U R' U R U2' R'",
      visualization: "2D",
    }),
  );
  const tw = new TwistyPlayer();
  document.querySelector("#visualization")!.appendChild(tw);
  tw.alg = new Alg("R U R' U R U2' R'");
  tw.visualization = "2D";
}

{
  document.querySelector("#hint-facelets")!.appendChild(
    new TwistyPlayer({
      alg: "R U R' U R U2' R'",
      hintFacelets: "none",
    }),
  );
  const tw = new TwistyPlayer();
  document.querySelector("#hint-facelets")!.appendChild(tw);
  tw.alg = new Alg("R U R' U R U2' R'");
  tw.hintFacelets = "none";
}

{
  document.querySelector("#experimental-stickering")!.appendChild(
    new TwistyPlayer({
      alg: "R U R' U R U2' R'",
      experimentalStickering: "OLL",
    }),
  );
  const tw = new TwistyPlayer();
  document.querySelector("#experimental-stickering")!.appendChild(tw);
  tw.alg = new Alg("R U R' U R U2' R'");
  tw.experimentalStickering = "OLL";
}

{
  document.querySelector("#background")!.appendChild(
    new TwistyPlayer({
      alg: "R U R' U R U2' R'",
      background: "none",
    }),
  );
  const tw = new TwistyPlayer();
  document.querySelector("#background")!.appendChild(tw);
  tw.alg = new Alg("R U R' U R U2' R'");
  tw.background = "none";
}

{
  document.querySelector("#control-panel")!.appendChild(
    new TwistyPlayer({
      alg: "R U R' U R U2' R'",
      controlPanel: "none",
    }),
  );
  const tw = new TwistyPlayer();
  document.querySelector("#control-panel")!.appendChild(tw);
  tw.alg = new Alg("R U R' U R U2' R'");
  tw.controlPanel = "none";
}

{
  document.querySelector("#back-view")!.appendChild(
    new TwistyPlayer({
      alg: "R U R' U R U2' R'",
      backView: "side-by-side",
    }),
  );
  const tw = new TwistyPlayer();
  document.querySelector("#back-view")!.appendChild(tw);
  tw.alg = new Alg("R U R' U R U2' R'");
  tw.backView = "side-by-side";
}

{
  document.querySelector("#camera-latitude")!.appendChild(
    new TwistyPlayer({
      alg: "R U R' U R U2' R'",
      cameraLatitude: 0,
    }),
  );
  const tw = new TwistyPlayer();
  document.querySelector("#camera-latitude")!.appendChild(tw);
  tw.alg = new Alg("R U R' U R U2' R'");
  tw.cameraLatitude = 0;
}

{
  document.querySelector("#camera-longitude")!.appendChild(
    new TwistyPlayer({
      alg: "R U R' U R U2' R'",
      cameraLongitude: 0,
    }),
  );
  const tw = new TwistyPlayer();
  document.querySelector("#camera-longitude")!.appendChild(tw);
  tw.alg = new Alg("R U R' U R U2' R'");
  tw.cameraLongitude = 0;
}

{
  document.querySelector("#camera-latitude-limit")!.appendChild(
    new TwistyPlayer({
      alg: "R U R' U R U2' R'",
      cameraLatitudeLimit: 90,
      cameraLatitude: 80,
    }),
  );
  const tw = new TwistyPlayer();
  document.querySelector("#camera-latitude-limit")!.appendChild(tw);
  tw.alg = new Alg("R U R' U R U2' R'");
  tw.cameraLatitudeLimit = 90;
  tw.cameraLatitude = 80;
}

{
  document.querySelector("#viewer-link")!.appendChild(
    new TwistyPlayer({
      alg: "R U R' U R U2' R'",
      viewerLink: "none",
    }),
  );
  const tw = new TwistyPlayer();
  document.querySelector("#viewer-link")!.appendChild(tw);
  tw.alg = new Alg("R U R' U R U2' R'");
  tw.viewerLink = "none";
}

{
  document.querySelector("#multiple-attributes")!.appendChild(
    new TwistyPlayer({
      alg: "R U R' U R U2' R'",
      experimentalSetupAnchor: "end",
      experimentalStickering: "OLL",
      background: "none",
      controlPanel: "none",
    }),
  );
  const tw = new TwistyPlayer();
  document.querySelector("#multiple-attributes")!.appendChild(tw);
  tw.alg = new Alg("R U R' U R U2' R'");
  tw.experimentalSetupAnchor = "end";
  tw.experimentalStickering = "OLL";
  tw.background = "none";
  tw.controlPanel = "none";
}
