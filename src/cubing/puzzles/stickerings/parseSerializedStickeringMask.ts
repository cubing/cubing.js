import type {
  FaceletMeshStickeringMask,
  PieceStickeringMask,
  StickeringMask,
} from "./mask";

const charMap: Record<string, FaceletMeshStickeringMask> = {
  "-": "regular",
  D: "dim",
  O: "oriented",
  I: "ignored",
  X: "invisible",
};

export function parseSerializedStickeringMask(
  serializedStickeringMask: string,
): StickeringMask {
  const stickeringMask: StickeringMask = {
    orbits: {},
  };
  const serializedOrbits = serializedStickeringMask.split(",");
  for (const serializedOrbit of serializedOrbits) {
    const [orbitName, serializedOrbitPieces, ...rest] =
      serializedOrbit.split(":");
    if (rest.length > 0) {
      throw new Error(
        `Invalid serialized orbit stickering mask (too many colones): \`${serializedOrbit}\``,
      );
    }
    if (serializedOrbitPieces.length % 2 !== 0) {
      throw new Error(
        `Invalid serialized orbit stickering mask (odd number of chars): \`${serializedOrbit}\``,
      );
    }
    const pieces: PieceStickeringMask[] = [];
    stickeringMask.orbits[orbitName] = { pieces };
    for (let i = 0; i < serializedOrbitPieces.length; i += 2) {
      const [primary, others] = serializedOrbitPieces.slice(i, i + 2);
      const primaryStickeringMask = charMap[primary];
      if (!primaryStickeringMask) {
        throw new Error(
          `Invalid facelet stickering mask identifier: \`${primary}\``,
        );
      }
      const otherStickeringMask = charMap[others];
      if (!otherStickeringMask) {
        throw new Error(
          `Invalid facelet stickering mask identifier: \`${others}\``,
        );
      }
      pieces.push({
        facelets: [
          primaryStickeringMask,
          otherStickeringMask,
          otherStickeringMask,
          otherStickeringMask,
          otherStickeringMask,
        ],
      });
    }
  }
  return stickeringMask;
}
