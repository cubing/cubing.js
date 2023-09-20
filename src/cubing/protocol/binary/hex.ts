export function bufferToSpacedHex(buffer: ArrayBuffer | Uint8Array): string {
  // buffer is an ArrayBuffer
  return (
    Array.prototype.map.call(new Uint8Array(buffer), (x: number) =>
      `00${x.toString(16)}`.slice(-2),
    ) as string[]
  ).join(" ");
}

export function spacedHexToBuffer(hex: string): Uint8Array {
  return new Uint8Array(hex.split(" ").map((c) => parseInt(c, 16)));
}
