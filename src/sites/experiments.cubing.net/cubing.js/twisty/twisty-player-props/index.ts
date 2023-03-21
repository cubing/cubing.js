// Stub file for testing.
// Feel free to add code here if you need a quick place to run some code, but avoid committing any changes.

import { Alg } from "../../../../../cubing/alg";
import { experimentalStickerings } from "../../../../../cubing/puzzles/cubing-private";
import {
  backViewLayouts,
  setTwistyDebug,
  TwistyPlayer,
} from "../../../../../cubing/twisty";
import { hintFaceletStyles } from "../../../../../cubing/twisty/model/props/puzzle/display/HintFaceletProp";
import { dragInputModes } from "../../../../../cubing/twisty/model/props/puzzle/state/DragInputProp";
import { indexerStrategyNames } from "../../../../../cubing/twisty/model/props/puzzle/state/IndexerConstructorRequestProp";
import { movePressInputNames } from "../../../../../cubing/twisty/model/props/puzzle/state/MovePressInputProp";
import { setupToLocations } from "../../../../../cubing/twisty/model/props/puzzle/state/SetupAnchorProp";
import {
  type PuzzleID,
  puzzleIDs,
} from "../../../../../cubing/twisty/model/props/puzzle/structure/PuzzleIDRequestProp";
import { backgroundThemes } from "../../../../../cubing/twisty/model/props/viewer/BackgroundProp";
import { controlsLocations } from "../../../../../cubing/twisty/model/props/viewer/ControlPanelProp";
import { viewerLinkPages } from "../../../../../cubing/twisty/model/props/viewer/ViewerLinkProp";
import { visualizationFormats } from "../../../../../cubing/twisty/model/props/viewer/VisualizationProp";
import { TwistyPlayerDebugger } from "./TwistyPropDebugger";

setTwistyDebug({ showRenderStats: true });

// alg="y' y' U' E D R2 r2 F2 B2 U E D' R2 L2' z2 S2 U U D D S2 F2' B2"
// control-panelly="none"
// background="none"
// experimental-stickering="picture"

(async () => {
  const puzzle = (new URL(location.href).searchParams.get("puzzle") ??
    "gigaminx") as PuzzleID;

  const twistyPlayer = document.body.appendChild(new TwistyPlayer({ puzzle }));
  document.body.appendChild(new TwistyPlayerDebugger(twistyPlayer));

  const alg =
    puzzle === "gigaminx"
      ? "(BL2 B2' DL2' B' BL' B' DL2' BL2 B' BL2' B2 BL DL2 B' DL BL B' BL2 DR2 U' (F2 FR2' D2 FR L2' 1-4BR 1-4R2' U)5 F2 FR2' D2 FR L2' 1-4BR 1-4R2' U2 2DR2 u2' 1-3R2 1-3BR' l2 fr' d2' fr2 f2' (u' 1-3R2 1-3BR' l2 fr' d2' fr2 f2')5 u dr2' bl2' b bl' dl' b dl2' bl' b2' bl2 b bl2' dl2 b bl b dl2 b2 bl2')"
      : "y' y' U' E D R2 r2 F2 B2 U E D' R2 L2' z2 S2 U U D D S2 F2' B2";
  twistyPlayer.alg = alg;

  document.body.appendChild(document.createElement("h1")).textContent =
    "<twisty-player>";

  const tableWrapper = document.body.appendChild(document.createElement("div"));
  tableWrapper.id = "inputs";
  const table = tableWrapper.appendChild(document.createElement("table"));

  const algOptions: [string, string, Alg][] = [
    ["alg", "alg", Alg.fromString(alg)],
    ["experimentalSetupAlg", "setupAlg", Alg.fromString("")],
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
      console.log(propName, input.value);
      (twistyPlayer as any)[propName] = input.value;
    };
    input.addEventListener("change", update);
    input.addEventListener("keyup", update);
    update();
  }

  const enumOptions: [string, string, Record<string, any>, string?][] = [
    ["anchor", "anchor", setupToLocations],
    ["puzzle", "puzzle", puzzleIDs, puzzle],
    [
      "visualization",
      "visualization",
      Object.assign({ auto: true }, visualizationFormats),
    ],
    [
      "hintFacelets",
      "hint-facelets",
      Object.assign({ auto: true }, hintFaceletStyles),
    ],
    [
      "experimentalStickering",
      "experimental-stickering",
      experimentalStickerings,
    ],

    [
      "background",
      "background",
      Object.assign({ auto: true }, backgroundThemes),
    ],
    [
      "controlPanel",
      "control-panel",
      Object.assign({ auto: true }, controlsLocations),
    ],

    ["backView", "back-view", Object.assign({ auto: true }, backViewLayouts)],

    [
      "experimentalDragInput",
      "experimental-drag-input",
      Object.assign({ auto: true }, dragInputModes),
    ],

    ["indexer", "indexer", Object.assign({ auto: true }, indexerStrategyNames)],

    [
      "experimentalMovePressInput",
      "experimental-move-press-input",
      Object.assign({ auto: true }, movePressInputNames),
    ],

    [
      "viewerLink",
      "viewer-link",
      Object.assign({ auto: true }, viewerLinkPages),
    ],
  ];

  for (const [propName, attrName, valueMap, defaultValue] of enumOptions) {
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

      if (value === defaultValue) {
        optionElem.selected = true;
      }
    }
    select.addEventListener("change", () => {
      console.log(attrName, select.value);
      if (propName in twistyPlayer) {
        (twistyPlayer as any)[propName] = select.value as any;
      } else {
        console.error("Invalid prop name!", propName);
      }
    });
  }

  const numberOptions: [string, string, number | null, number | null][] = [
    ["cameraLatitude", "camera-latitude", null, null],
    ["cameraLongitude", "camera-longitude", null, null],
    ["cameraDistance", "camera-distance", 6, null],
    ["cameraLatitudeLimit", "camera-latitude-limit", 35, null],
    ["tempoScale", "tempo-scale", 1, 0.1],
  ];

  for (const [propName, attrName, initialValue, step] of numberOptions) {
    const tr = table.appendChild(document.createElement("tr"));

    const td1 = tr.appendChild(document.createElement("td"));
    td1.appendChild(document.createElement("code")).textContent = attrName;

    const td2 = tr.appendChild(document.createElement("td"));
    const input = td2.appendChild(document.createElement("input"));
    if (initialValue !== null) {
      input.value = initialValue.toString();
    }
    input.type = "number";
    input.placeholder = "(no value)";
    if (step !== null) {
      input.step = step.toString();
    }
    const update = () => {
      if (input.value === "") {
        return;
      }
      if (propName in twistyPlayer) {
        (twistyPlayer as any)[propName] = input.value;
      } else {
        console.error("Invalid prop name!", propName);
      }
    };
    input.addEventListener("input", update);
    // input.addEventListener("change", update);
    input.addEventListener("keyup", update);
  }
})();
