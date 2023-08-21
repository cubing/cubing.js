import { Move } from "../../alg";
import type { KPuzzleDefinition } from "../../kpuzzle";

export interface NotationMapper {
  notationToInternal(move: Move): Move | null;
  notationToExternal(move: Move): Move | null;
}

export function remapKPuzzleDefinition(
  internalDefinition: KPuzzleDefinition,
  notationMapper: NotationMapper,
): KPuzzleDefinition {
  const externalDefinition: KPuzzleDefinition = {
    ...internalDefinition,
    moves: {},
  };
  for (const [internalMoveName, transformationData] of Object.entries(
    internalDefinition.moves,
  )) {
    let prefix = internalMoveName;
    let suffix = "";
    if (["v", "w"].includes(internalMoveName.at(-1)!)) {
      prefix = internalMoveName.slice(0, -1);
      suffix = internalMoveName.slice(-1);
    }
    const externalPrefix = notationMapper.notationToExternal(
      Move.fromString(prefix),
    );
    if (!externalPrefix) {
      continue;
    }
    const externalMoveName = externalPrefix + suffix;
    if (!externalMoveName) {
      throw new Error(
        `Missing external move name for: ${internalMoveName.toString()}`,
      );
    }
    externalDefinition.moves[externalMoveName.toString()] = transformationData;
  }
  return externalDefinition;
}
