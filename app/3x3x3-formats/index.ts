import { parse } from "../../src/alg";
import {
  KPuzzle,
  Puzzles,
  SVG,
  Transformation,
  OrbitTransformation,
} from "../../src/kpuzzle";
import {
  binaryComponentsToReid3x3x3,
  reid3x3x3ToBinaryComponents,
  reid3x3x3ToTwizzleBinary,
  twizzleBinaryToReid3x3x3,
} from "../../src/protocol/binary/binary3x3x3";

function kpuzzleToString(state: Transformation): string {
  return JSON.stringify(state, null, "  ")
    .replace(/\n +(\d+),/g, "$1, ")
    .replace(/\n +(\d+)\n +/g, "$1");
}

const def = Puzzles["3x3x3"];

export function bufferToSpacedHex(buffer: ArrayBuffer): string {
  // buffer is an ArrayBuffer
  return Array.prototype.map
    .call(new Uint8Array(buffer), (x: number) =>
      ("00" + x.toString(16)).slice(-2),
    )
    .join(" ");
}

export function spacedHexToBuffer(hex: string): Uint8Array {
  return new Uint8Array(hex.split(" ").map((c) => parseInt(c, 16)));
}

class App {
  kpuzzle = new KPuzzle(def);
  svg = new SVG(def);
  algTextarea = document.querySelector("#alg")! as HTMLTextAreaElement;
  kpuzzleTextarea = document.querySelector("#kpuzzle")! as HTMLTextAreaElement;
  reidStringTextarea = document.querySelector(
    "#reid-string",
  )! as HTMLTextAreaElement;

  stickersTextarea = document.querySelector(
    "#stickers",
  )! as HTMLTextAreaElement;

  componentsTextarea = document.querySelector(
    "#components",
  )! as HTMLTextAreaElement;

  binaryTextarea = document.querySelector("#binary")! as HTMLTextAreaElement;
  constructor() {
    document.querySelector("#viewer")!.appendChild(this.svg.element);

    document.querySelector("#reset")!.addEventListener("click", () => {
      this.kpuzzle.reset();
      this.setState(this.kpuzzle.state);
    });
    document.querySelector("#apply-alg")!.addEventListener("click", () => {
      this.applyAlg(this.algTextarea.value);
    });
    document
      .querySelector("#set-reid-string")
      ?.addEventListener("click", () => {
        this.setReidString(this.reidStringTextarea.value);
      });
    document.querySelector("#set-stickers")!.addEventListener("click", () => {
      this.setStickers(this.stickersTextarea.value);
    });
    document.querySelector("#set-components")!.addEventListener("click", () => {
      this.setComponents(this.componentsTextarea.value);
    });
    document.querySelector("#set-kpuzzle")!.addEventListener("click", () => {
      this.setKPuzzle(this.kpuzzleTextarea.value);
    });
    document.querySelector("#set-binary")!.addEventListener("click", () => {
      this.setBinary(this.binaryTextarea.value);
    });

    this.setState(this.kpuzzle.state);

    // const scene = new Twisty3DScene();
    // const cube3D = new Cube3D();
    // scene.add(cube3D);
    // const canvas = new Twisty3DCanvas(scene);
    // document.body.appendChild(canvas);
  }

  applyAlg(s: string): void {
    this.kpuzzle.applyAlg(parse(s));
    this.setState(this.kpuzzle.state);
  }

  setKPuzzle(s: string): void {
    this.setState(JSON.parse(s));
  }

  setReidString(s: string): void {
    this.setState(reidStringToKPuzzle(s));
  }

  setStickers(s: string): void {
    this.setState(reidStringToKPuzzle(stickersToReidString(JSON.parse(s))));
  }

  setComponents(s: string): void {
    this.setState(binaryComponentsToReid3x3x3(JSON.parse(s)));
  }

  setBinary(s: string): void {
    this.setState(twizzleBinaryToReid3x3x3(spacedHexToBuffer(s)));
  }

  setState(state: Transformation): void {
    this.kpuzzle.state = state;
    this.svg.draw(def, state);
    this.kpuzzleTextarea.value = kpuzzleToString(state);
    const reidString = kpuzzleToReidString(state);
    this.reidStringTextarea.value = reidString;
    this.stickersTextarea.value = JSON.stringify(
      reidStringToStickers(reidString),
    );
    this.componentsTextarea.value = JSON.stringify(
      reid3x3x3ToBinaryComponents(state),
      null,
      "  ",
    );
    this.binaryTextarea.value = bufferToSpacedHex(
      reid3x3x3ToTwizzleBinary(state),
    );
  }
}

const pieceNames: Record<string, string[]> = {
  EDGE: "UF UR UB UL DF DR DB DL FR FL BR BL".split(" "),
  CORNER: "UFR URB UBL ULF DRF DFL DLB DBR".split(" "),
  CENTER: "ULFRBD".split(""),
};

interface PieceInfo {
  piece: number;
  orientation: number;
}

function rotateLeft(s: string, i: number): string {
  return s.slice(i) + s.slice(0, i);
}

const pieceMap: { [s: string]: PieceInfo } = {};
// TODO: Condense the for loops.

const orbits = Object.keys(def.orbits);
for (const orbit of orbits) {
  pieceNames[orbit].forEach((piece, idx) => {
    const numOri = orbit === "CENTER" ? 1 : def.orbits[orbit].orientations;
    for (let i = 0; i < numOri; i++) {
      const name = rotateLeft(piece, i);
      pieceMap[name] = { piece: idx, orientation: i };
      if (numOri === 3) {
        const altName = name[0] + name[2] + name[1];
        pieceMap[altName] = { piece: idx, orientation: i };
      }
    }
  });
}

function kpuzzleToReidString(state: Transformation): string {
  const pieces: string[] = [];

  const addOrbit = (orbitName: string): void => {
    for (let i = 0; i < state[orbitName].permutation.length; i++) {
      pieces.push(
        rotateLeft(
          pieceNames[orbitName][state[orbitName].permutation[i]],
          state[orbitName].orientation[i],
        ),
      );
    }
  };

  for (const orbit of orbits) {
    addOrbit(orbit);
  }

  return pieces.join(" ");
}

const reidStringStickerIdx = Array.prototype.concat.apply(Array.prototype, [
  [44, 6, 40, 9, 68, 3, 48, 0, 36], // end of U
  [46, 10, 49, 34, 70, 28, 61, 22, 58], // end of L
  [50, 1, 37, 27, 72, 24, 57, 13, 54], // end of F
  [38, 4, 41, 25, 74, 31, 53, 16, 66], // end of R
  [42, 7, 45, 30, 76, 33, 65, 19, 62], // end of B
  [56, 12, 52, 21, 78, 15, 60, 18, 64], // end of D
]);

function reidStringToStickers(s: string): number[] {
  const arr: number[] = [];
  for (let i = 0; i < reidStringStickerIdx.length; i++) {
    const stickerColorFaceName = s[reidStringStickerIdx[i]];
    const stickerColorIdx = pieceNames["CENTER"].indexOf(stickerColorFaceName);
    arr.push(stickerColorIdx);
  }
  return arr;
}

function stickersToReidString(stickers: number[]): string {
  const reidStringChars = new Array(79).fill(" ");

  for (let i = 0; i < reidStringStickerIdx.length; i++) {
    const stickerColorIdx = stickers[i];
    reidStringChars[reidStringStickerIdx[i]] =
      pieceNames["CENTER"][stickerColorIdx];
  }
  return reidStringChars.join("");
}

function reidStringToKPuzzle(s: string): Transformation {
  const pieces = s.split(" ");

  const orbit = (pieces: string[]): OrbitTransformation => {
    const orbitTransformation: OrbitTransformation = {
      permutation: [],
      orientation: [],
    };
    for (const piece of pieces) {
      orbitTransformation.permutation.push(pieceMap[piece].piece);
      orbitTransformation.orientation.push(pieceMap[piece].orientation);
    }
    return orbitTransformation;
  };

  const x = {
    EDGE: orbit(pieces.slice(0, 12)),
    CORNER: orbit(pieces.slice(12, 20)),
    CENTER: orbit(pieces.slice(20, 26)),
  };
  return x;
}

(window as any).app = new App();
