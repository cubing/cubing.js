import {
  Transformation,
  Puzzles,
  OrbitTransformation,
} from "../../src/kpuzzle";

export function kpuzzleToString(state: Transformation): string {
  return JSON.stringify(state, null, "  ")
    .replace(/\n +(\d+),/g, "$1, ")
    .replace(/\n +(\d+)\n +/g, "$1");
}

const def = Puzzles["3x3x3"];

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

export function kpuzzleToReidString(state: Transformation): string {
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

export function reidStringToStickers(s: string): number[] {
  const arr: number[] = [];
  for (let i = 0; i < reidStringStickerIdx.length; i++) {
    const stickerColorFaceName = s[reidStringStickerIdx[i]];
    const stickerColorIdx = pieceNames["CENTER"].indexOf(stickerColorFaceName);
    arr.push(stickerColorIdx);
  }
  return arr;
}

export function stickersToReidString(stickers: number[]): string {
  const reidStringChars = new Array(79).fill(" ");

  for (let i = 0; i < reidStringStickerIdx.length; i++) {
    const stickerColorIdx = stickers[i];
    reidStringChars[reidStringStickerIdx[i]] =
      pieceNames["CENTER"][stickerColorIdx];
  }
  return reidStringChars.join("");
}

export function kpuzzleToStickers(state: Transformation): number[] {
  return reidStringToStickers(kpuzzleToReidString(state));
}

export function stickersToKPuzzle(stickers: number[]): Transformation {
  return reidStringToKPuzzle(stickersToReidString(stickers));
}

export function reidStringToKPuzzle(s: string): Transformation {
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
