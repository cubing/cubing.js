import { KPattern } from "../../../../cubing/kpuzzle";
import type {
  KPatternOrbitData,
  KPuzzleDefinition,
} from "../../../../cubing/kpuzzle/KPuzzleDefinition";
import { experimental3x3x3KPuzzle } from "../../../../cubing/puzzles/cubing-private";

function neatStringify(data: any): string {
  return JSON.stringify(data, null, "  ")
    .replace(/\n +(\d+),/g, "$1, ")
    .replace(/\n +(\d+)\n +/g, "$1");
}

export function patternToString(pattern: KPattern): string {
  return neatStringify(pattern.patternData);
}

export function defToString(pattern: KPuzzleDefinition): string {
  return neatStringify(pattern);
}

const pieceNames: Record<string, string[]> = {
  EDGES: "UF UR UB UL DF DR DB DL FR FL BR BL".split(" "),
  CORNERS: "UFR URB UBL ULF DRF DFL DLB DBR".split(" "),
  CENTERS: "ULFRBD".split(""),
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

for (const orbitDefinition of experimental3x3x3KPuzzle.definition.orbits) {
  pieceNames[orbitDefinition.orbitName].forEach((piece, idx) => {
    const numOri =
      orbitDefinition.orbitName === "CENTERS"
        ? 1
        : orbitDefinition.numOrientations;
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

export function kpatternToReidString(pattern: KPattern): string {
  const pieces: string[] = [];

  for (const orbitDefinition of pattern.kpuzzle.definition.orbits) {
    for (
      let i = 0;
      i < pattern.patternData[orbitDefinition.orbitName].pieces.length;
      i++
    ) {
      pieces.push(
        rotateLeft(
          pieceNames[orbitDefinition.orbitName][
            pattern.patternData[orbitDefinition.orbitName].pieces[i]
          ],
          pattern.patternData[orbitDefinition.orbitName].orientation[i],
        ),
      );
    }
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
    const stickerColorIdx = pieceNames["CENTERS"].indexOf(stickerColorFaceName);
    arr.push(stickerColorIdx);
  }
  return arr;
}

export function stickersToReidString(stickers: number[]): string {
  const reidStringChars = new Array(79).fill(" ");

  for (let i = 0; i < reidStringStickerIdx.length; i++) {
    const stickerColorIdx = stickers[i];
    reidStringChars[reidStringStickerIdx[i]] =
      pieceNames["CENTERS"][stickerColorIdx];
  }
  return reidStringChars.join("");
}

export function patternToStickers(pattern: KPattern): number[] {
  return reidStringToStickers(kpatternToReidString(pattern));
}

export function stickersToKPattern(stickers: number[]): KPattern {
  return reidStringToKPattern(stickersToReidString(stickers));
}

export function reidStringToKPattern(s: string): KPattern {
  const pieces = s.split(" ");

  const orbit = (pieces: string[]): KPatternOrbitData => {
    const patternData: KPatternOrbitData = {
      pieces: [],
      orientation: [],
    };
    for (const piece of pieces) {
      patternData.pieces.push(pieceMap[piece].piece);
      patternData.orientation.push(pieceMap[piece].orientation);
    }
    return patternData;
  };

  const patternData = {
    EDGES: orbit(pieces.slice(0, 12)),
    CORNERS: orbit(pieces.slice(12, 20)),
    CENTERS: orbit(pieces.slice(20, 26)),
  };
  return new KPattern(experimental3x3x3KPuzzle, patternData);
}
