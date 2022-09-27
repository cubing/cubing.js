// Stub file for testing.
// Feel free to add code here if you need a quick place to run some code, but avoid committing any changes.

import { TwistyPlayer } from "../../../../cubing/twisty";

const player = document.body.appendChild(new TwistyPlayer());
setTimeout(() => {
  player.experimentalModel.twistySceneModel.puzzleAppearance.set({
    orbits: {
      EDGES: {
        pieces: [
          { facelets: ["dim", "dim"] }, // UF
          { facelets: ["dim", "dim"] }, // UR
          { facelets: ["dim", "dim"] }, // UB
          { facelets: ["dim", "dim"] }, // UL
          { facelets: ["ignored", "ignored"] }, // DF
          { facelets: ["ignored", "ignored"] }, // DR
          { facelets: ["ignored", "ignored"] }, // DB
          { facelets: ["ignored", "ignored"] }, // DL
          { facelets: ["ignored", "ignored"] }, // FR
          { facelets: ["ignored", "ignored"] }, // FL
          { facelets: ["ignored", "ignored"] }, // BR
          { facelets: ["ignored", "ignored"] }, // BL
        ],
      },
      CORNERS: {
        pieces: [
          { facelets: ["oriented", "ignored", "ignored"] }, // UFR
          { facelets: ["oriented", "ignored", "ignored"] }, // URB
          { facelets: ["oriented", "ignored", "ignored"] }, // UBL
          { facelets: ["oriented", "ignored", "ignored"] }, // ULF
          { facelets: ["ignored", "ignored", "ignored"] }, // DRF
          { facelets: ["ignored", "ignored", "ignored"] }, // DFL
          { facelets: ["ignored", "ignored", "ignored"] }, // DLB
          { facelets: ["ignored", "ignored", "ignored"] }, // DBR
        ],
      },
      CENTERS: {
        pieces: [
          { facelets: ["regular"] }, // U
          { facelets: ["dim"] }, // L
          { facelets: ["dim"] }, // F
          { facelets: ["dim"] }, // R
          { facelets: ["dim"] }, // B
          { facelets: ["dim"] }, // D
        ],
      },
    },
  });
}, 100);
