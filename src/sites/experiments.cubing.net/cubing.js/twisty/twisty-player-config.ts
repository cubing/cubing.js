import {
  backgroundThemes,
  cameraLatitudeLimits,
  controlsLocations,
  experimentalStickerings,
  hintFaceletStyles,
  puzzleIDs,
  setupToLocations,
  viewerLinkPages,
  visualizationFormats,
} from "../../../../cubing/twisty/old/dom/TwistyPlayerConfig"; // TODO
import { backViewLayouts } from "../../../../cubing/twisty/old/dom/viewers/TwistyViewerWrapper";
import { Alg } from "../../../../cubing/alg";
import { TwistyPlayer } from "../../../../cubing/twisty";

const contentElem = document.querySelector(".content")!;

const twistyPlayer: TwistyPlayer = new TwistyPlayer();
contentElem.appendChild(twistyPlayer);

const table = contentElem.appendChild(document.createElement("table"));

const algOptions: [string, string, Alg][] = [
  ["alg", "alg", Alg.fromString("R U R'")],
  ["experimentalSetupAlg", "experimental-setup-alg", Alg.fromString("")],
];

for (const [propName, attrName, alg] of algOptions) {
  const tr = table.appendChild(document.createElement("tr"));

  const td1 = tr.appendChild(document.createElement("td"));
  td1.appendChild(document.createElement("code")).textContent = attrName;

  const td2 = tr.appendChild(document.createElement("td"));
  const input = td2.appendChild(document.createElement("input"));
  input.value = alg.toString();
  input.placeholder = "(none)";
  const update = () => {
    (twistyPlayer as any)[propName] = Alg.fromString(input.value);
  };
  input.addEventListener("change", update);
  input.addEventListener("keyup", update);
  update();
}

const enumOptions: [string, string, Record<string, any>][] = [
  ["experimentalSetupAnchor", "experimental-setup-anchor", setupToLocations],
  ["puzzle", "puzzle", puzzleIDs],
  ["visualization", "visualization", visualizationFormats],
  ["hintFacelets", "hint-facelets", hintFaceletStyles],
  [
    "experimentalStickering",
    "experimental-stickering",
    experimentalStickerings,
  ],

  ["background", "background", backgroundThemes],
  ["controlPanel", "control-panel", controlsLocations],

  ["backView", "back-view", backViewLayouts],

  ["viewerLink", "viewer-link", viewerLinkPages],
];

for (const [propName, attrName, valueMap] of enumOptions) {
  const tr = table.appendChild(document.createElement("tr"));

  const td1 = tr.appendChild(document.createElement("td"));
  td1.appendChild(document.createElement("code")).textContent = attrName;

  const td2 = tr.appendChild(document.createElement("td"));
  const select = document.createElement("select");
  td2.appendChild(select);

  for (const value in valueMap) {
    const optionElem = select.appendChild(document.createElement("option"));
    optionElem.textContent = value;
    optionElem.value = value;
  }
  select.addEventListener("change", () => {
    console.log(attrName, select.value);
    (twistyPlayer as any)[propName] = select.value as any;
  });
  contentElem.append(document.createElement("br"));
}

const numberOptions: [string, string, number][] = [
  ["cameraLatitude", "camera-latitude", 0],
  ["cameraLongitude", "camera-longitude", 0],
  ["cameraLatitudeLimit", "camera-latitude-limit", 35],
];

for (const [propName, attrName, alg] of numberOptions) {
  const tr = table.appendChild(document.createElement("tr"));

  const td1 = tr.appendChild(document.createElement("td"));
  td1.appendChild(document.createElement("code")).textContent = attrName;

  const td2 = tr.appendChild(document.createElement("td"));
  const input = td2.appendChild(document.createElement("input"));
  input.value = alg.toString();
  input.type = "number";
  input.placeholder = "(no value)";
  input.value = "";
  const update = () => {
    if (input.value === "") {
      return;
    }
    (twistyPlayer as any)[propName] = input.value;
  };
  input.addEventListener("input", update);
  // input.addEventListener("change", update);
  input.addEventListener("keyup", update);
}
