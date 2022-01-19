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
  for (const [internalMoveName, moveTransformation] of Object.entries(
    internalDefinition.moves,
  )) {
    externalDefinition.moves[
      notationMapper.notationToExternal(new Move(internalMoveName))!.toString()
    ] = moveTransformation;
  }
  return externalDefinition;
}
