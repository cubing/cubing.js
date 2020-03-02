import { KPuzzleDefinition } from "./definition_types";
import { sq1SVG } from "./definitions/svg";

export const Puzzles: { [key: string]: KPuzzleDefinition } = {
  222: {
    name: "222",
    orbits: { CORNERS: { numPieces: 7, orientations: 3 } },
    startPieces: { CORNERS: { permutation: [0, 1, 2, 3, 4, 5, 6], orientation: [0, 0, 0, 0, 0, 0, 0] } },
    moves: {
      U: { CORNERS: { permutation: [3, 0, 1, 2, 4, 5, 6], orientation: [0, 0, 0, 0, 0, 0, 0] } },
      R: { CORNERS: { permutation: [0, 2, 5, 3, 1, 4, 6], orientation: [0, 2, 1, 0, 1, 2, 0] } },
      F: { CORNERS: { permutation: [0, 1, 3, 6, 4, 2, 5], orientation: [0, 0, 0, 0, 0, 0, 0] } },
    },
    svg: "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n<!DOCTYPE svg PUBLIC \"-//W3C//DTD SVG 1.0//EN\"\n       \"http://www.w3.org/TR/2001/REC-SVG-20050904/DTD/svg11.dtd\">\n<svg xmlns=\"http://www.w3.org/2000/svg\" version=\"1.1\" xmlns:xlink=\"http://www.w3.org/1999/xlink\" viewBox=\"0 0 490 370\" preserveAspectRatio=\"xMidYMid meet\">\n  <defs>\n  </defs>\n  <title>222</title>\n  <defs>\n    <g id=\"sticker\">\n        <rect x=\"0\" y=\"0\" width=\"1\" height=\"1\" stroke=\"black\" stroke-width=\"0.04px\" />\n    </g>\n  </defs>\n  <g id=\"puzzle\" transform=\"translate(5, 5) scale(60)\">\n    <use id=\"CORNERS-l0-o0\" xlink:href=\"#sticker\" transform=\"translate(2, 0)\" style=\"fill: white\"/>\n    <use id=\"CORNERS-l0-o1\" xlink:href=\"#sticker\" transform=\"translate(7, 2)\" style=\"fill: blue\"/>\n    <use id=\"CORNERS-l0-o2\" xlink:href=\"#sticker\" transform=\"translate(0, 2)\" style=\"fill: orange\"/>\n\n    <use id=\"CORNERS-l1-o0\" xlink:href=\"#sticker\" transform=\"translate(3, 0)\" style=\"fill: white\"/>\n    <use id=\"CORNERS-l1-o1\" xlink:href=\"#sticker\" transform=\"translate(5, 2)\" style=\"fill: red\"/>\n    <use id=\"CORNERS-l1-o2\" xlink:href=\"#sticker\" transform=\"translate(6, 2)\" style=\"fill: blue\"/>\n\n    <use id=\"CORNERS-l2-o0\" xlink:href=\"#sticker\" transform=\"translate(3, 1)\" style=\"fill: white\"/>\n    <use id=\"CORNERS-l2-o1\" xlink:href=\"#sticker\" transform=\"translate(3, 2)\" style=\"fill: green\"/>\n    <use id=\"CORNERS-l2-o2\" xlink:href=\"#sticker\" transform=\"translate(4, 2)\" style=\"fill: red\"/>\n\n    <use id=\"CORNERS-l3-o0\" xlink:href=\"#sticker\" transform=\"translate(2, 1)\" style=\"fill: white\"/>\n    <use id=\"CORNERS-l3-o1\" xlink:href=\"#sticker\" transform=\"translate(1, 2)\" style=\"fill: orange\"/>\n    <use id=\"CORNERS-l3-o2\" xlink:href=\"#sticker\" transform=\"translate(2, 2)\" style=\"fill: green\"/>\n\n    <use id=\"CORNERS-l4-o0\" xlink:href=\"#sticker\" transform=\"translate(3, 5)\" style=\"fill: yellow\"/>\n    <use id=\"CORNERS-l4-o1\" xlink:href=\"#sticker\" transform=\"translate(6, 3)\" style=\"fill: blue\"/>\n    <use id=\"CORNERS-l4-o2\" xlink:href=\"#sticker\" transform=\"translate(5, 3)\" style=\"fill: red\"/>\n\n    <use id=\"CORNERS-l5-o0\" xlink:href=\"#sticker\" transform=\"translate(3, 4)\" style=\"fill: yellow\"/>\n    <use id=\"CORNERS-l5-o1\" xlink:href=\"#sticker\" transform=\"translate(4, 3)\" style=\"fill: red\"/>\n    <use id=\"CORNERS-l5-o2\" xlink:href=\"#sticker\" transform=\"translate(3, 3)\" style=\"fill: green\"/>\n\n    <use id=\"CORNERS-l6-o0\" xlink:href=\"#sticker\" transform=\"translate(2, 4)\" style=\"fill: yellow\"/>\n    <use id=\"CORNERS-l6-o1\" xlink:href=\"#sticker\" transform=\"translate(2, 3)\" style=\"fill: green\"/>\n    <use id=\"CORNERS-l6-o2\" xlink:href=\"#sticker\" transform=\"translate(1, 3)\" style=\"fill: orange\"/>\n\n    <use                    xlink:href=\"#sticker\" transform=\"translate(2, 5)\" style=\"fill: yellow\"/>\n    <use                    xlink:href=\"#sticker\" transform=\"translate(0, 3)\" style=\"fill: orange\"/>\n    <use                    xlink:href=\"#sticker\" transform=\"translate(7, 3)\" style=\"fill: blue\"/>\n  </g>\n\n</svg>",
  },
  333: {

    // Michael Reid 3x3x3 piece order + centers with orientation
    name: "333",
    orbits: {
      EDGE: { numPieces: 12, orientations: 2 },
      CORNER: { numPieces: 8, orientations: 3 },
      CENTER: { numPieces: 6, orientations: 4 },
    },
    startPieces: {
      EDGE: { permutation: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11], orientation: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0] },
      CORNER: { permutation: [0, 1, 2, 3, 4, 5, 6, 7], orientation: [0, 0, 0, 0, 0, 0, 0, 0] },
      CENTER: { permutation: [0, 1, 2, 3, 4, 5], orientation: [0, 0, 0, 0, 0, 0] },
    },
    moves: {
      U: {
        EDGE: { permutation: [1, 2, 3, 0, 4, 5, 6, 7, 8, 9, 10, 11], orientation: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0] },
        CORNER: { permutation: [1, 2, 3, 0, 4, 5, 6, 7], orientation: [0, 0, 0, 0, 0, 0, 0, 0] },
        CENTER: { permutation: [0, 1, 2, 3, 4, 5], orientation: [1, 0, 0, 0, 0, 0] },
      },
      y: {
        EDGE: { permutation: [1, 2, 3, 0, 5, 6, 7, 4, 10, 8, 11, 9], orientation: [0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1] },
        CORNER: { permutation: [1, 2, 3, 0, 7, 4, 5, 6], orientation: [0, 0, 0, 0, 0, 0, 0, 0] },
        CENTER: { permutation: [0, 2, 3, 4, 1, 5], orientation: [1, 0, 0, 0, 0, 3] },
      },
      x: {
        EDGE: { permutation: [4, 8, 0, 9, 6, 10, 2, 11, 5, 7, 1, 3], orientation: [1, 0, 1, 0, 1, 0, 1, 0, 0, 0, 0, 0] },
        CORNER: { permutation: [4, 0, 3, 5, 7, 6, 2, 1], orientation: [2, 1, 2, 1, 1, 2, 1, 2] },
        CENTER: { permutation: [2, 1, 5, 3, 0, 4], orientation: [0, 3, 0, 1, 2, 2] },
      },
      // const moves: {move: string, def: string}[] = [
      //   {move: "L", def: "[y' x: U]"},
      //   {move: "F", def: "[x: U]"},
      //   {move: "R", def: "[y x: U]"},
      //   {move: "B", def: "[x': U]"},
      //   {move: "D", def: "[x2: U]"},
      //   {move: "z", def: "[y: x]"},
      //   {move: "M", def: "R L' x'"},
      //   {move: "E", def: "[z': M]"},
      //   {move: "S", def: "[y': M]"},
      //   {move: "u", def: "D y"},
      //   {move: "l", def: "R x'"},
      //   {move: "f", def: "B z"},
      //   {move: "r", def: "L x"},
      //   {move: "b", def: "F z'"},
      //   {move: "d", def: "U y'"}
      // ];
      L: {
        EDGE: { permutation: [0, 1, 2, 11, 4, 5, 6, 9, 8, 3, 10, 7], orientation: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0] },
        CORNER: { permutation: [0, 1, 6, 2, 4, 3, 5, 7], orientation: [0, 0, 2, 1, 0, 2, 1, 0] },
        CENTER: { permutation: [0, 1, 2, 3, 4, 5], orientation: [0, 1, 0, 0, 0, 0] },
      },
      F: {
        EDGE: { permutation: [9, 1, 2, 3, 8, 5, 6, 7, 0, 4, 10, 11], orientation: [1, 0, 0, 0, 1, 0, 0, 0, 1, 1, 0, 0] },
        CORNER: { permutation: [3, 1, 2, 5, 0, 4, 6, 7], orientation: [1, 0, 0, 2, 2, 1, 0, 0] },
        CENTER: { permutation: [0, 1, 2, 3, 4, 5], orientation: [0, 0, 1, 0, 0, 0] },
      },
      R: {
        EDGE: { permutation: [0, 8, 2, 3, 4, 10, 6, 7, 5, 9, 1, 11], orientation: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0] },
        CORNER: { permutation: [4, 0, 2, 3, 7, 5, 6, 1], orientation: [2, 1, 0, 0, 1, 0, 0, 2] },
        CENTER: { permutation: [0, 1, 2, 3, 4, 5], orientation: [0, 0, 0, 1, 0, 0] },
      },
      B: {
        EDGE: { permutation: [0, 1, 10, 3, 4, 5, 11, 7, 8, 9, 6, 2], orientation: [0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 1] },
        CORNER: { permutation: [0, 7, 1, 3, 4, 5, 2, 6], orientation: [0, 2, 1, 0, 0, 0, 2, 1] },
        CENTER: { permutation: [0, 1, 2, 3, 4, 5], orientation: [0, 0, 0, 0, 1, 0] },
      },
      D: {
        EDGE: { permutation: [0, 1, 2, 3, 7, 4, 5, 6, 8, 9, 10, 11], orientation: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0] },
        CORNER: { permutation: [0, 1, 2, 3, 5, 6, 7, 4], orientation: [0, 0, 0, 0, 0, 0, 0, 0] },
        CENTER: { permutation: [0, 1, 2, 3, 4, 5], orientation: [0, 0, 0, 0, 0, 1] },
      },
      z: {
        EDGE: { permutation: [9, 3, 11, 7, 8, 1, 10, 5, 0, 4, 2, 6], orientation: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1] },
        CORNER: { permutation: [3, 2, 6, 5, 0, 4, 7, 1], orientation: [1, 2, 1, 2, 2, 1, 2, 1] },
        CENTER: { permutation: [1, 5, 2, 0, 4, 3], orientation: [1, 1, 1, 1, 3, 1] },
      },
      M: {
        EDGE: { permutation: [2, 1, 6, 3, 0, 5, 4, 7, 8, 9, 10, 11], orientation: [1, 0, 1, 0, 1, 0, 1, 0, 0, 0, 0, 0] },
        CORNER: { permutation: [0, 1, 2, 3, 4, 5, 6, 7], orientation: [0, 0, 0, 0, 0, 0, 0, 0] },
        CENTER: { permutation: [4, 1, 0, 3, 5, 2], orientation: [2, 0, 0, 0, 2, 0] },
      },
      E: {
        EDGE: { permutation: [0, 1, 2, 3, 4, 5, 6, 7, 9, 11, 8, 10], orientation: [0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1] },
        CORNER: { permutation: [0, 1, 2, 3, 4, 5, 6, 7], orientation: [0, 0, 0, 0, 0, 0, 0, 0] },
        CENTER: { permutation: [0, 4, 1, 2, 3, 5], orientation: [0, 0, 0, 0, 0, 0] },
      },
      S: {
        EDGE: { permutation: [0, 3, 2, 7, 4, 1, 6, 5, 8, 9, 10, 11], orientation: [0, 1, 0, 1, 0, 1, 0, 1, 0, 0, 0, 0] },
        CORNER: { permutation: [0, 1, 2, 3, 4, 5, 6, 7], orientation: [0, 0, 0, 0, 0, 0, 0, 0] },
        CENTER: { permutation: [1, 5, 2, 0, 4, 3], orientation: [1, 1, 0, 1, 0, 1] },
      },
      u: {
        EDGE: { permutation: [1, 2, 3, 0, 4, 5, 6, 7, 10, 8, 11, 9], orientation: [0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1] },
        CORNER: { permutation: [1, 2, 3, 0, 4, 5, 6, 7], orientation: [0, 0, 0, 0, 0, 0, 0, 0] },
        CENTER: { permutation: [0, 2, 3, 4, 1, 5], orientation: [1, 0, 0, 0, 0, 0] },
      },
      l: {
        EDGE: { permutation: [2, 1, 6, 11, 0, 5, 4, 9, 8, 3, 10, 7], orientation: [1, 0, 1, 0, 1, 0, 1, 0, 0, 0, 0, 0] },
        CORNER: { permutation: [0, 1, 6, 2, 4, 3, 5, 7], orientation: [0, 0, 2, 1, 0, 2, 1, 0] },
        CENTER: { permutation: [4, 1, 0, 3, 5, 2], orientation: [2, 1, 0, 0, 2, 0] },
      },
      f: {
        EDGE: { permutation: [9, 3, 2, 7, 8, 1, 6, 5, 0, 4, 10, 11], orientation: [1, 1, 0, 1, 1, 1, 0, 1, 1, 1, 0, 0] },
        CORNER: { permutation: [3, 1, 2, 5, 0, 4, 6, 7], orientation: [1, 0, 0, 2, 2, 1, 0, 0] },
        CENTER: { permutation: [1, 5, 2, 0, 4, 3], orientation: [1, 1, 1, 1, 0, 1] },
      },
      r: {
        EDGE: { permutation: [4, 8, 0, 3, 6, 10, 2, 7, 5, 9, 1, 11], orientation: [1, 0, 1, 0, 1, 0, 1, 0, 0, 0, 0, 0] },
        CORNER: { permutation: [4, 0, 2, 3, 7, 5, 6, 1], orientation: [2, 1, 0, 0, 1, 0, 0, 2] },
        CENTER: { permutation: [2, 1, 5, 3, 0, 4], orientation: [0, 0, 0, 1, 2, 2] },
      },
      b: {
        EDGE: { permutation: [8, 5, 2, 1, 9, 7, 6, 3, 4, 0, 10, 11], orientation: [1, 1, 0, 1, 1, 1, 0, 1, 1, 1, 0, 0] },
        CORNER: { permutation: [4, 1, 2, 0, 5, 3, 6, 7], orientation: [1, 0, 0, 2, 2, 1, 0, 0] },
        CENTER: { permutation: [3, 0, 2, 5, 4, 1], orientation: [3, 3, 3, 3, 0, 3] },
      },
      d: {
        EDGE: { permutation: [0, 1, 2, 3, 7, 4, 5, 6, 9, 11, 8, 10], orientation: [0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1] },
        CORNER: { permutation: [0, 1, 2, 3, 5, 6, 7, 4], orientation: [0, 0, 0, 0, 0, 0, 0, 0] },
        CENTER: { permutation: [0, 4, 1, 2, 3, 5], orientation: [0, 0, 0, 0, 0, 1] },
      },
    },
    svg: "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n<!DOCTYPE svg PUBLIC \"-//W3C//DTD SVG 1.0//EN\"\n       \"http://www.w3.org/TR/2001/REC-SVG-20050904/DTD/svg11.dtd\">\n<svg xmlns=\"http://www.w3.org/2000/svg\" version=\"1.1\" xmlns:xlink=\"http://www.w3.org/1999/xlink\" viewBox=\"0 0 490 370\" preserveAspectRatio=\"xMidYMid meet\">\n  <defs>\n  </defs>\n  <title>333</title>\n  <defs>\n    <g id=\"sticker\">\n        <rect x=\"0\" y=\"0\" width=\"1\" height=\"1\" stroke=\"black\" stroke-width=\"0.04px\" />\n    </g>\n  </defs>\n\n<!--        0 1 2 3 4 5 6 7 8 9 10 11  -->\n<!--        | | | | | | | | | | | |<-  -->\n<!--    0 -       . . .                -->\n<!--    1 -       . . .                -->\n<!--    2 -       . . .                -->\n<!--    3 - . . . . . . . . . . . .    -->\n<!--    4 - . . . . . . . . . . . .    -->\n<!--    5 - . . . . . . . . . . . .    -->\n<!--    6 -       . . .                -->\n<!--    7 -       . . .                -->\n<!--    8 -       . . .                -->\n\n  <g id=\"puzzle\" transform=\"translate(5, 5) scale(40)\">\n    <!-- CORNER -->\n    <use id=\"CORNER-l0-o0\" xlink:href=\"#sticker\" transform=\"translate(5,  2)\" style=\"fill: white\"/>\n    <use id=\"CORNER-l0-o1\" xlink:href=\"#sticker\" transform=\"translate(6,  3)\" style=\"fill: red\"/>\n    <use id=\"CORNER-l0-o2\" xlink:href=\"#sticker\" transform=\"translate(5,  3)\" style=\"fill: green\"/>\n\n    <use id=\"CORNER-l1-o0\" xlink:href=\"#sticker\" transform=\"translate(5,  0)\" style=\"fill: white\"/>\n    <use id=\"CORNER-l1-o1\" xlink:href=\"#sticker\" transform=\"translate(9,  3)\" style=\"fill: blue\"/>\n    <use id=\"CORNER-l1-o2\" xlink:href=\"#sticker\" transform=\"translate(8,  3)\" style=\"fill: red\"/>\n\n    <use id=\"CORNER-l2-o0\" xlink:href=\"#sticker\" transform=\"translate(3,  0)\" style=\"fill: white\"/>\n    <use id=\"CORNER-l2-o1\" xlink:href=\"#sticker\" transform=\"translate(0,  3)\" style=\"fill: orange\"/>\n    <use id=\"CORNER-l2-o2\" xlink:href=\"#sticker\" transform=\"translate(11, 3)\" style=\"fill: blue\"/>\n\n    <use id=\"CORNER-l3-o0\" xlink:href=\"#sticker\" transform=\"translate(3,  2)\" style=\"fill: white\"/>\n    <use id=\"CORNER-l3-o1\" xlink:href=\"#sticker\" transform=\"translate(3,  3)\" style=\"fill: green\"/>\n    <use id=\"CORNER-l3-o2\" xlink:href=\"#sticker\" transform=\"translate(2,  3)\" style=\"fill: orange\"/>\n\n    <use id=\"CORNER-l4-o0\" xlink:href=\"#sticker\" transform=\"translate(5,  6)\" style=\"fill: yellow\"/>\n    <use id=\"CORNER-l4-o1\" xlink:href=\"#sticker\" transform=\"translate(5,  5)\" style=\"fill: green\"/>\n    <use id=\"CORNER-l4-o2\" xlink:href=\"#sticker\" transform=\"translate(6,  5)\" style=\"fill: red\"/>\n\n    <use id=\"CORNER-l5-o0\" xlink:href=\"#sticker\" transform=\"translate(3,  6)\" style=\"fill: yellow\"/>\n    <use id=\"CORNER-l5-o1\" xlink:href=\"#sticker\" transform=\"translate(2,  5)\" style=\"fill: orange\"/>\n    <use id=\"CORNER-l5-o2\" xlink:href=\"#sticker\" transform=\"translate(3,  5)\" style=\"fill: green\"/>\n\n    <use id=\"CORNER-l6-o0\" xlink:href=\"#sticker\" transform=\"translate(3,  8)\" style=\"fill: yellow\"/>\n    <use id=\"CORNER-l6-o1\" xlink:href=\"#sticker\" transform=\"translate(11, 5)\" style=\"fill: blue\"/>\n    <use id=\"CORNER-l6-o2\" xlink:href=\"#sticker\" transform=\"translate(0, 5)\"  style=\"fill: orange\"/>\n\n    <use id=\"CORNER-l7-o0\" xlink:href=\"#sticker\" transform=\"translate(5,  8)\" style=\"fill: yellow\"/>\n    <use id=\"CORNER-l7-o1\" xlink:href=\"#sticker\" transform=\"translate(8,  5)\" style=\"fill: red\"/>\n    <use id=\"CORNER-l7-o2\" xlink:href=\"#sticker\" transform=\"translate(9,  5)\" style=\"fill: blue\"/>\n\n    <!-- EDGE -->\n    <use id=\"EDGE-l0-o0\"  xlink:href=\"#sticker\" transform=\"translate(4,  2)\" style=\"fill: white\"/>\n    <use id=\"EDGE-l0-o1\"  xlink:href=\"#sticker\" transform=\"translate(4,  3)\" style=\"fill: green\"/>\n\n    <use id=\"EDGE-l1-o0\"  xlink:href=\"#sticker\" transform=\"translate(5,  1)\" style=\"fill: white\"/>\n    <use id=\"EDGE-l1-o1\"  xlink:href=\"#sticker\" transform=\"translate(7,  3)\" style=\"fill: red\"/>\n\n    <use id=\"EDGE-l2-o0\"  xlink:href=\"#sticker\" transform=\"translate(4,  0)\" style=\"fill: white\"/>\n    <use id=\"EDGE-l2-o1\"  xlink:href=\"#sticker\" transform=\"translate(10, 3)\" style=\"fill: blue\"/>\n\n    <use id=\"EDGE-l3-o0\"  xlink:href=\"#sticker\" transform=\"translate(3,  1)\" style=\"fill: white\"/>\n    <use id=\"EDGE-l3-o1\"  xlink:href=\"#sticker\" transform=\"translate(1,  3)\" style=\"fill: orange\"/>\n\n    <use id=\"EDGE-l4-o0\"  xlink:href=\"#sticker\" transform=\"translate(4,  6)\" style=\"fill: yellow\"/>\n    <use id=\"EDGE-l4-o1\"  xlink:href=\"#sticker\" transform=\"translate(4,  5)\" style=\"fill: green\"/>\n\n    <use id=\"EDGE-l5-o0\" xlink:href=\"#sticker\" transform=\"translate(5,  7)\" style=\"fill: yellow\"/>\n    <use id=\"EDGE-l5-o1\" xlink:href=\"#sticker\" transform=\"translate(7,  5)\" style=\"fill: red\"/>\n\n    <use id=\"EDGE-l6-o0\" xlink:href=\"#sticker\" transform=\"translate(4,  8)\" style=\"fill: yellow\"/>\n    <use id=\"EDGE-l6-o1\" xlink:href=\"#sticker\" transform=\"translate(10, 5)\" style=\"fill: blue\"/>\n\n    <use id=\"EDGE-l7-o0\"  xlink:href=\"#sticker\" transform=\"translate(3,  7)\" style=\"fill: yellow\"/>\n    <use id=\"EDGE-l7-o1\"  xlink:href=\"#sticker\" transform=\"translate(1,  5)\" style=\"fill: orange\"/>\n\n    <use id=\"EDGE-l8-o0\"  xlink:href=\"#sticker\" transform=\"translate(5,  4)\" style=\"fill: green\"/>\n    <use id=\"EDGE-l8-o1\"  xlink:href=\"#sticker\" transform=\"translate(6,  4)\" style=\"fill: red\"/>\n\n    <use id=\"EDGE-l9-o0\"  xlink:href=\"#sticker\" transform=\"translate(3,  4)\" style=\"fill: green\"/>\n    <use id=\"EDGE-l9-o1\"  xlink:href=\"#sticker\" transform=\"translate(2,  4)\" style=\"fill: orange\"/>\n\n    <use id=\"EDGE-l10-o0\" xlink:href=\"#sticker\" transform=\"translate(9,  4)\" style=\"fill: blue\"/>\n    <use id=\"EDGE-l10-o1\" xlink:href=\"#sticker\" transform=\"translate(8,  4)\" style=\"fill: red\"/>\n\n    <use id=\"EDGE-l11-o0\" xlink:href=\"#sticker\" transform=\"translate(11, 4)\" style=\"fill: blue\"/>\n    <use id=\"EDGE-l11-o1\" xlink:href=\"#sticker\" transform=\"translate(0,  4)\" style=\"fill: orange\"/>\n\n    <!-- CENTER -->\n    <!-- TODO: Allow the same sticker to be reused for multiple orientations -->\n    <use id=\"CENTER-l0-o0\" xlink:href=\"#sticker\" transform=\"translate(4,  1)\" style=\"fill: white\"/>\n    <use id=\"CENTER-l0-o1\" xlink:href=\"#sticker\" transform=\"translate(4,  1)\" style=\"fill: white\"/>\n    <use id=\"CENTER-l0-o2\" xlink:href=\"#sticker\" transform=\"translate(4,  1)\" style=\"fill: white\"/>\n    <use id=\"CENTER-l0-o3\" xlink:href=\"#sticker\" transform=\"translate(4,  1)\" style=\"fill: white\"/>\n\n    <use id=\"CENTER-l1-o0\" xlink:href=\"#sticker\" transform=\"translate(1,  4)\" style=\"fill: orange\"/>\n    <use id=\"CENTER-l1-o1\" xlink:href=\"#sticker\" transform=\"translate(1,  4)\" style=\"fill: orange\"/>\n    <use id=\"CENTER-l1-o2\" xlink:href=\"#sticker\" transform=\"translate(1,  4)\" style=\"fill: orange\"/>\n    <use id=\"CENTER-l1-o3\" xlink:href=\"#sticker\" transform=\"translate(1,  4)\" style=\"fill: orange\"/>\n\n    <use id=\"CENTER-l2-o0\" xlink:href=\"#sticker\" transform=\"translate(4,  4)\" style=\"fill: green\"/>\n    <use id=\"CENTER-l2-o1\" xlink:href=\"#sticker\" transform=\"translate(4,  4)\" style=\"fill: green\"/>\n    <use id=\"CENTER-l2-o2\" xlink:href=\"#sticker\" transform=\"translate(4,  4)\" style=\"fill: green\"/>\n    <use id=\"CENTER-l2-o3\" xlink:href=\"#sticker\" transform=\"translate(4,  4)\" style=\"fill: green\"/>\n\n    <use id=\"CENTER-l3-o0\" xlink:href=\"#sticker\" transform=\"translate(7,  4)\" style=\"fill: red\"/>\n    <use id=\"CENTER-l3-o1\" xlink:href=\"#sticker\" transform=\"translate(7,  4)\" style=\"fill: red\"/>\n    <use id=\"CENTER-l3-o2\" xlink:href=\"#sticker\" transform=\"translate(7,  4)\" style=\"fill: red\"/>\n    <use id=\"CENTER-l3-o3\" xlink:href=\"#sticker\" transform=\"translate(7,  4)\" style=\"fill: red\"/>\n\n    <use id=\"CENTER-l4-o0\" xlink:href=\"#sticker\" transform=\"translate(10, 4)\" style=\"fill: blue\"/>\n    <use id=\"CENTER-l4-o1\" xlink:href=\"#sticker\" transform=\"translate(10, 4)\" style=\"fill: blue\"/>\n    <use id=\"CENTER-l4-o2\" xlink:href=\"#sticker\" transform=\"translate(10, 4)\" style=\"fill: blue\"/>\n    <use id=\"CENTER-l4-o3\" xlink:href=\"#sticker\" transform=\"translate(10, 4)\" style=\"fill: blue\"/>\n\n    <use id=\"CENTER-l5-o0\" xlink:href=\"#sticker\" transform=\"translate(4,  7)\" style=\"fill: yellow\"/>\n    <use id=\"CENTER-l5-o1\" xlink:href=\"#sticker\" transform=\"translate(4,  7)\" style=\"fill: yellow\"/>\n    <use id=\"CENTER-l5-o2\" xlink:href=\"#sticker\" transform=\"translate(4,  7)\" style=\"fill: yellow\"/>\n    <use id=\"CENTER-l5-o3\" xlink:href=\"#sticker\" transform=\"translate(4,  7)\" style=\"fill: yellow\"/>\n  </g>\n\n</svg>\n",
  },
  pyram: {
    name: "pyram",
    orbits: {
      CENTERS: { numPieces: 4, orientations: 3 },
      TIPS: { numPieces: 4, orientations: 3 },
      EDGES: { numPieces: 6, orientations: 2 },
    },
    startPieces: {
      CENTERS: { permutation: [0, 1, 2, 3], orientation: [0, 0, 0, 0] },
      TIPS: { permutation: [0, 1, 2, 3], orientation: [0, 0, 0, 0] },
      EDGES: { permutation: [0, 1, 2, 3, 4, 5], orientation: [0, 0, 0, 0, 0, 0] },
    },
    moves: {
      U: {
        CENTERS: { permutation: [0, 1, 2, 3], orientation: [1, 0, 0, 0] },
        TIPS: { permutation: [0, 1, 2, 3], orientation: [1, 0, 0, 0] },
        EDGES: { permutation: [1, 2, 0, 3, 4, 5], orientation: [1, 0, 1, 0, 0, 0] },
      },
      L: {
        CENTERS: { permutation: [0, 1, 2, 3], orientation: [0, 1, 0, 0] },
        TIPS: { permutation: [0, 1, 2, 3], orientation: [0, 1, 0, 0] },
        EDGES: { permutation: [5, 1, 2, 0, 4, 3], orientation: [1, 0, 0, 0, 0, 1] },
      },
      R: {
        CENTERS: { permutation: [0, 1, 2, 3], orientation: [0, 0, 1, 0] },
        TIPS: { permutation: [0, 1, 2, 3], orientation: [0, 0, 1, 0] },
        EDGES: { permutation: [0, 3, 2, 4, 1, 5], orientation: [0, 0, 0, 1, 1, 0] },
      },
      B: {
        CENTERS: { permutation: [0, 1, 2, 3], orientation: [0, 0, 0, 1] },
        TIPS: { permutation: [0, 1, 2, 3], orientation: [0, 0, 0, 1] },
        EDGES: { permutation: [0, 1, 4, 3, 5, 2], orientation: [0, 0, 0, 0, 1, 1] },
      },
      u: {
        CENTERS: { permutation: [0, 1, 2, 3], orientation: [0, 0, 0, 0] },
        TIPS: { permutation: [0, 1, 2, 3], orientation: [1, 0, 0, 0] },
        EDGES: { permutation: [0, 1, 2, 3, 4, 5], orientation: [0, 0, 0, 0, 0, 0] },
      },
      l: {
        CENTERS: { permutation: [0, 1, 2, 3], orientation: [0, 0, 0, 0] },
        TIPS: { permutation: [0, 1, 2, 3], orientation: [0, 1, 0, 0] },
        EDGES: { permutation: [0, 1, 2, 3, 4, 5], orientation: [0, 0, 0, 0, 0, 0] },
      },
      r: {
        CENTERS: { permutation: [0, 1, 2, 3], orientation: [0, 0, 0, 0] },
        TIPS: { permutation: [0, 1, 2, 3], orientation: [0, 0, 1, 0] },
        EDGES: { permutation: [0, 1, 2, 3, 4, 5], orientation: [0, 0, 0, 0, 0, 0] },
      },
      b: {
        CENTERS: { permutation: [0, 1, 2, 3], orientation: [0, 0, 0, 0] },
        TIPS: { permutation: [0, 1, 2, 3], orientation: [0, 0, 0, 1] },
        EDGES: { permutation: [0, 1, 2, 3, 4, 5], orientation: [0, 0, 0, 0, 0, 0] },
      },
    },
    svg: "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n<!DOCTYPE svg PUBLIC \"-//W3C//DTD SVG 1.0//EN\"\n       \"http://www.w3.org/TR/2001/REC-SVG-20050904/DTD/svg11.dtd\">\n<svg xmlns=\"http://www.w3.org/2000/svg\" version=\"1.1\" xmlns:xlink=\"http://www.w3.org/1999/xlink\" viewBox=\"0 0 490 420.69219392\" preserveAspectRatio=\"xMidYMid meet\">\n  <defs>\n  </defs>\n  <title>222</title>\n  <defs>\n    <g id=\"stickerA\" transform=\"scale(1, 0.577350269)\">\n      <path\n         d=\"m 0,1.732050808 1,-1.732050808 1,1.732050808 z\"\n         stroke=\"black\" stroke-width=\"0.04px\" stroke-linecap=\"butt\" stroke-linejoin=\"round\"\n      />\n    </g>\n    <g id=\"stickerV\" transform=\"scale(1, 0.577350269)\">\n      <path\n         d=\"m 0,0 1,1.732050808 1,-1.732050808 z\"\n         stroke=\"black\" stroke-width=\"0.04px\" stroke-linecap=\"butt\" stroke-linejoin=\"round\"\n      />\n    </g>\n  </defs>\n\n<!--        0 1 2 3 4 5 6 7 8 9 10   -->\n<!--        | | | | | | | | | | |    -->\n<!--    0 - L L L L L F R R R R R    -->\n<!--    1 -   L L L F F F R R R      -->\n<!--    2 -     L F F F F F R        -->\n<!--    3 -       D D D D D          -->\n<!--    4 -         D D D            -->\n<!--    5 -           D              -->\n\n  <g id=\"puzzle\" transform=\"translate(5, 5) scale(40, 69.28203232)\">\n    <!-- CENTERS -->\n    <use id=\"CENTERS-l0-o0\" xlink:href=\"#stickerV\" transform=\"translate(5, 1)\" style=\"fill: yellow\"/>\n    <use id=\"CENTERS-l0-o1\" xlink:href=\"#stickerA\" transform=\"translate(3, 0)\" style=\"fill: blue\"/>\n    <use id=\"CENTERS-l0-o2\" xlink:href=\"#stickerA\" transform=\"translate(7, 0)\" style=\"fill: red\"/>\n\n    <use id=\"CENTERS-l1-o0\" xlink:href=\"#stickerV\" transform=\"translate(4, 2)\" style=\"fill: yellow\"/>\n    <use id=\"CENTERS-l1-o1\" xlink:href=\"#stickerA\" transform=\"translate(4, 3)\" style=\"fill: green\"/>\n    <use id=\"CENTERS-l1-o2\" xlink:href=\"#stickerA\" transform=\"translate(2, 1)\" style=\"fill: blue\"/>\n\n    <use id=\"CENTERS-l2-o0\" xlink:href=\"#stickerV\" transform=\"translate(6, 2)\" style=\"fill: yellow\"/>\n    <use id=\"CENTERS-l2-o1\" xlink:href=\"#stickerA\" transform=\"translate(8, 1)\" style=\"fill: red\"/>\n    <use id=\"CENTERS-l2-o2\" xlink:href=\"#stickerA\" transform=\"translate(6, 3)\" style=\"fill: green\"/>\n\n    <use id=\"CENTERS-l3-o0\" xlink:href=\"#stickerA\" transform=\"translate(9, 0)\" style=\"fill: red\"/>\n    <use id=\"CENTERS-l3-o1\" xlink:href=\"#stickerA\" transform=\"translate(1, 0)\" style=\"fill: blue\"/>\n    <use id=\"CENTERS-l3-o2\" xlink:href=\"#stickerA\" transform=\"translate(5, 4)\" style=\"fill: green\"/>\n\n    <!-- TIPS -->\n    <use id=\"TIPS-l0-o0\" xlink:href=\"#stickerA\" transform=\"translate(5, 0)\" style=\"fill: yellow\"/>\n    <use id=\"TIPS-l0-o1\" xlink:href=\"#stickerV\" transform=\"translate(4, 0)\" style=\"fill: blue\"/>\n    <use id=\"TIPS-l0-o2\" xlink:href=\"#stickerV\" transform=\"translate(6, 0)\" style=\"fill: red\"/>\n\n    <use id=\"TIPS-l1-o0\" xlink:href=\"#stickerA\" transform=\"translate(3, 2)\" style=\"fill: yellow\"/>\n    <use id=\"TIPS-l1-o1\" xlink:href=\"#stickerV\" transform=\"translate(3, 3)\" style=\"fill: green\"/>\n    <use id=\"TIPS-l1-o2\" xlink:href=\"#stickerV\" transform=\"translate(2, 2)\" style=\"fill: blue\"/>\n\n    <use id=\"TIPS-l2-o0\" xlink:href=\"#stickerV\" transform=\"translate(8, 2)\" style=\"fill: red\"/>\n    <use id=\"TIPS-l2-o1\" xlink:href=\"#stickerV\" transform=\"translate(7, 3)\" style=\"fill: green\"/>\n    <use id=\"TIPS-l2-o2\" xlink:href=\"#stickerA\" transform=\"translate(7, 2)\" style=\"fill: yellow\"/>\n\n    <use id=\"TIPS-l3-o0\" xlink:href=\"#stickerV\" transform=\"translate(10,0)\" style=\"fill: red\"/>\n    <use id=\"TIPS-l3-o1\" xlink:href=\"#stickerV\" transform=\"translate(0, 0)\" style=\"fill: blue\"/>\n    <use id=\"TIPS-l3-o2\" xlink:href=\"#stickerV\" transform=\"translate(5, 5)\" style=\"fill: green\"/>\n\n    <!-- EDGES -->\n    <use id=\"EDGES-l0-o0\" xlink:href=\"#stickerA\" transform=\"translate(4, 1)\" style=\"fill: yellow\"/>\n    <use id=\"EDGES-l0-o1\" xlink:href=\"#stickerV\" transform=\"translate(3, 1)\" style=\"fill: blue\"/>\n\n    <use id=\"EDGES-l1-o0\" xlink:href=\"#stickerA\" transform=\"translate(6, 1)\" style=\"fill: yellow\"/>\n    <use id=\"EDGES-l1-o1\" xlink:href=\"#stickerV\" transform=\"translate(7, 1)\" style=\"fill: red\"/>\n\n    <use id=\"EDGES-l2-o0\" xlink:href=\"#stickerV\" transform=\"translate(8, 0)\" style=\"fill: red\"/>\n    <use id=\"EDGES-l2-o1\" xlink:href=\"#stickerV\" transform=\"translate(2, 0)\" style=\"fill: blue\"/>\n\n    <use id=\"EDGES-l3-o0\" xlink:href=\"#stickerV\" transform=\"translate(5, 3)\" style=\"fill: green\"/>\n    <use id=\"EDGES-l3-o1\" xlink:href=\"#stickerA\" transform=\"translate(5, 2)\" style=\"fill: yellow\"/>\n\n    <use id=\"EDGES-l4-o0\" xlink:href=\"#stickerV\" transform=\"translate(6, 4)\" style=\"fill: green\"/>\n    <use id=\"EDGES-l4-o1\" xlink:href=\"#stickerV\" transform=\"translate(9, 1)\" style=\"fill: red\"/>\n\n    <use id=\"EDGES-l5-o0\" xlink:href=\"#stickerV\" transform=\"translate(4, 4)\" style=\"fill: green\"/>\n    <use id=\"EDGES-l5-o1\" xlink:href=\"#stickerV\" transform=\"translate(1, 1)\" style=\"fill: blue\"/>\n  </g>\n\n</svg>",
  },
  sq1: {
    name: "sq1",
    orbits: { WEDGE: { numPieces: 24, orientations: 9 }, EQUATOR: { numPieces: 2, orientations: 6 } },
    startPieces: {
      WEDGE: { permutation: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23], orientation: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0] },
      EQUATOR: { permutation: [0, 1], orientation: [0, 0] },
    },
    moves: {
      U: {
        WEDGE: { permutation: [11, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23], orientation: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0] },
        EQUATOR: { permutation: [0, 1], orientation: [0, 0] },
      },
      D: {
        WEDGE: { permutation: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 23, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22], orientation: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0] },
        EQUATOR: { permutation: [0, 1], orientation: [0, 0] },
      },
      SLICE: {
        WEDGE: { permutation: [0, 1, 2, 3, 4, 5, 12, 13, 14, 15, 16, 17, 6, 7, 8, 9, 10, 11, 18, 19, 20, 21, 22, 23], orientation: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0] },
        EQUATOR: { permutation: [0, 1], orientation: [0, 3] },
      },
    },
    svg: sq1SVG,
  },
};
