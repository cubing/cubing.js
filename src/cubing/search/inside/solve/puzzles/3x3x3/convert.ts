/*

Face order:

 U
LFRB
 D

         | 0| 1| 2|
         | 3| 4| 5|
         | 6| 7| 8|
| 9|10|11|18|19|20|27|28|29|36|37|38|
|12|13|14|21|22|23|30|31|32|39|40|41|
|15|16|17|24|25|26|33|34|35|42|43|44|
         |45|46|47|
         |48|49|50|
         |51|52|53|
*/

import type { KPattern } from "../../../../../kpuzzle/KPattern";

const reidEdgeOrder = "UF UR UB UL DF DR DB DL FR FL BR BL".split(" ");
const reidCornerOrder = "UFR URB UBL ULF DRF DFL DLB DBR".split(" ");
const centerOrder = "U L F R B D".split(" ");

// const stickers = [reidEdgeOrder, reidCornerOrder, centerOrder];

// /*
//                |1 20|0 20|1 10|
//                |0 30|2 00|0 10|
//                |1 30|0 00|1 00|
// |1 22|0 31|1 31|1 32|0 01|1 01|1 02|0 11|1 11|1 12|0 21|1 21|
// |0111|2 10|0 91|0 90|2 20|0 80|0 81|2 30|0101|0100|2 40|0110|
// |1 61|0 71|1 52|1 51|0 41|1 42|1 41|0 51|1 72|1 71|0 61|1 62|
//                |1 50|0 40|1 40|
//                |0 70|2 50|0 50|
//                |1 60|0 60|1 70|
// */

const map: [number, number, number][] = [
  [1, 2, 0],
  [0, 2, 0],
  [1, 1, 0],
  [0, 3, 0],
  [2, 0, 0],
  [0, 1, 0],
  [1, 3, 0],
  [0, 0, 0],
  [1, 0, 0],
  [1, 0, 2],
  [0, 1, 1],
  [1, 1, 1],
  [0, 8, 1],
  [2, 3, 0],
  [0, 10, 1],
  [1, 4, 1],
  [0, 5, 1],
  [1, 7, 2],
  [1, 3, 2],
  [0, 0, 1],
  [1, 0, 1],
  [0, 9, 0],
  [2, 2, 0],
  [0, 8, 0],
  [1, 5, 1],
  [0, 4, 1],
  [1, 4, 2],
  [1, 5, 0],
  [0, 4, 0],
  [1, 4, 0],
  [0, 7, 0],
  [2, 5, 0],
  [0, 5, 0],
  [1, 6, 0],
  [0, 6, 0],
  [1, 7, 0],
  [1, 2, 2],
  [0, 3, 1],
  [1, 3, 1],
  [0, 11, 1],
  [2, 1, 0],
  [0, 9, 1],
  [1, 6, 1],
  [0, 7, 1],
  [1, 5, 2],
  [1, 1, 2],
  [0, 2, 1],
  [1, 2, 1],
  [0, 10, 0],
  [2, 4, 0],
  [0, 11, 0],
  [1, 7, 1],
  [0, 6, 1],
  [1, 6, 2],
];

function rotateLeft(s: string, i: number): string {
  return s.slice(i) + s.slice(0, i);
}

function toReid333Struct(pattern: KPattern): string[][] {
  const output: string[][] = [[], []];
  for (let i = 0; i < 6; i++) {
    if (pattern.patternData["CENTERS"].pieces[i] !== i) {
      throw new Error("non-oriented puzzles are not supported");
    }
  }
  for (let i = 0; i < 12; i++) {
    output[0].push(
      rotateLeft(
        reidEdgeOrder[pattern.patternData["EDGES"].pieces[i]],
        pattern.patternData["EDGES"].orientation[i],
      ),
    );
  }
  for (let i = 0; i < 8; i++) {
    output[1].push(
      rotateLeft(
        reidCornerOrder[pattern.patternData["CORNERS"].pieces[i]],
        pattern.patternData["CORNERS"].orientation[i],
      ),
    );
  }
  output.push(centerOrder);
  return output;
}

// function toReid333String(state: Transformation): string {
//   return toReid333Struct(state)
//     .map((l) => l.join(" "))
//     .join(" ");
// }

export function toMin2PhasePattern(pattern: KPattern): string {
  const reid = toReid333Struct(pattern);
  return map.map(([orbit, perm, ori]) => reid[orbit][perm][ori]).join("");
}
