import type {
  FaceletMeshAppearance,
  PieceAppearance,
  PuzzleAppearance,
} from "./mask";

const charMap: Record<string, FaceletMeshAppearance> = {
  "-": "regular",
  D: "dim",
  O: "oriented",
  I: "ignored",
  X: "invisible",
};

export function parseSerializedAppearance(
  serializedAppearance: string,
): PuzzleAppearance {
  const puzzleAppearance: PuzzleAppearance = {
    orbits: {},
  };
  const serializedOrbits = serializedAppearance.split(",");
  for (const serializedOrbit of serializedOrbits) {
    const [orbitName, serializedOrbitPieces, ...rest] =
      serializedOrbit.split(":");
    if (rest.length > 0) {
      throw new Error(
        `Invalid serialized orbit appearance (too many colones): \`${serializedOrbit}\``,
      );
    }
    if (serializedOrbitPieces.length % 2 !== 0) {
      throw new Error(
        `Invalid serialized orbit appearance (odd number of chars): \`${serializedOrbit}\``,
      );
    }
    const orbitAppearancePieces: PieceAppearance[] = [];
    puzzleAppearance.orbits[orbitName] = { pieces: orbitAppearancePieces };
    for (let i = 0; i < serializedOrbitPieces.length; i += 2) {
      const [primary, others] = serializedOrbitPieces.slice(i, i + 2);
      const primaryFaceletAppearance = charMap[primary];
      if (!primaryFaceletAppearance) {
        throw new Error(
          `Invalid facelet appearance identifier: \`${primary}\``,
        );
      }
      const restFaceletAppearance = charMap[others];
      if (!restFaceletAppearance) {
        throw new Error(`Invalid facelet appearance identifier: \`${others}\``);
      }
      orbitAppearancePieces.push({
        facelets: [
          primaryFaceletAppearance,
          restFaceletAppearance,
          restFaceletAppearance,
          restFaceletAppearance,
          restFaceletAppearance,
        ],
      });
    }
  }
  return puzzleAppearance;
}

console.log(
  parseSerializedAppearance(
    "EDGES:-I-I-I-IDDDDDDDDDDDDDDDD,CORNERS:-I-I-I-IDDDDDDDD,CENTERS:-DDDDD",
  ),
);
