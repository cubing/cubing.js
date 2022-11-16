import { randomUIntBelow } from "random-uint-below";

const pins = ["UR", "DR", "DL", "UL"];
const backMoves = ["U", "R", "D", "L", "ALL"];
const frontMoves = pins.concat(backMoves);

export function randomClockScrambleString(): string {
  let filteringMoveCount = 0;

  function randomSuffix() {
    const amount = randomUIntBelow(12);
    if (amount !== 0) {
      filteringMoveCount++;
    }
    if (amount <= 6) {
      return `${amount}+`;
    } else {
      return `${12 - amount}-`;
    }
  }

  const moves = [];
  function side(families: string[]): void {
    for (const family of families) {
      moves.push(`${family}${randomSuffix()}`);
    }
  }

  side(frontMoves);
  moves.push("y2");
  side(backMoves);

  // https://www.worldcubeassociation.org/regulations/#4b3
  if (filteringMoveCount < 2) {
    return randomClockScrambleString();
  }

  for (const pin of pins) {
    if (randomUIntBelow(2) === 0) {
      moves.push(pin);
    }
  }
  return moves.join(" ");
}
