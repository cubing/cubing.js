import { randomUIntBelow } from "../../../../vendor/random-uint-below";

const suffixes = ["++", "--"];

export function randomMegaminxScrambleString(): string {
  function rdPair(): string {
    return `R${suffixes[randomUIntBelow(2)]} D${suffixes[randomUIntBelow(2)]}`;
  }

  function randomU(): string {
    return `U${["", "'"][randomUIntBelow(2)]}`;
  }

  function row(): string {
    const chunks = [];
    for (let i = 0; i < 5; i++) {
      chunks.push(rdPair());
    }
    chunks.push(randomU());
    return chunks.join(" ");
  }

  const chunks = [];
  for (let i = 0; i < 6; i++) {
    chunks.push(row());
  }
  return chunks.join("\n");
}
