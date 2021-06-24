import { randomUIntBelowFactory } from "../vendor/random-uint-below";

const randomUIntBelowPromise = randomUIntBelowFactory();

const suffixes = ["++", "--"];

export async function randomMegaminxScrambleString(): Promise<string> {
  const randomUIntBelow = await randomUIntBelowPromise;

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
