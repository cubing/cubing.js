import type { Move } from "../../alg/index.ts";
import type { NotationMapper } from "./NotationMapper.ts";

export class NullMapper implements NotationMapper {
  public notationToInternal(move: Move): Move | null {
    return move;
  }

  public notationToExternal(move: Move): Move | null {
    return move;
  }
}
