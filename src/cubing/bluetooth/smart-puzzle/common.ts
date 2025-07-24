import type { KPatternData } from "../../kpuzzle";

const reidEdgeOrder = "UF UR UB UL DF DR DB DL FR FL BR BL".split(" ");
const reidCornerOrder = "UFR URB UBL ULF DRF DFL DLB DBR".split(" ");

interface PieceInfo {
  piece: number;
  orientation: number;
}

function rotateLeft(s: string, i: number): string {
  return s.slice(i) + s.slice(0, i);
}

const pieceMap: { [s: string]: PieceInfo } = {};
// TODO: Condense the for loops.
reidEdgeOrder.forEach((edge, idx) => {
  for (let i = 0; i < 2; i++) {
    pieceMap[rotateLeft(edge, i)] = { piece: idx, orientation: i };
  }
});
reidCornerOrder.forEach((corner, idx) => {
  for (let i = 0; i < 3; i++) {
    pieceMap[rotateLeft(corner, i)] = { piece: idx, orientation: i };
  }
});

export function getPatternData(
  stickers: number[],
  faceOrder: string,
  edgeMappings: number[][],
  cornerMappings: number[][],
): KPatternData {
  const patternData: KPatternData = {
    CORNERS: {
      pieces: [],
      orientation: [],
    },
    EDGES: {
      pieces: [],
      orientation: [],
    },
    CENTERS: {
      pieces: [0, 1, 2, 3, 4, 5],
      orientation: [0, 0, 0, 0, 0, 0],
      orientationMod: [1, 1, 1, 1, 1, 1],
    },
  };

  for (const cornerMapping of cornerMappings) {
    const pieceInfo: PieceInfo =
      pieceMap[cornerMapping.map((i) => faceOrder[stickers[i]]).join("")];
    patternData["CORNERS"].pieces.push(pieceInfo.piece);
    patternData["CORNERS"].orientation.push(pieceInfo.orientation);
  }

  for (const edgeMapping of edgeMappings) {
    const pieceInfo: PieceInfo =
      pieceMap[edgeMapping.map((i) => faceOrder[stickers[i]]).join("")];
    patternData["EDGES"].pieces.push(pieceInfo.piece);
    patternData["EDGES"].orientation.push(pieceInfo.orientation);
  }

  return patternData;
}
