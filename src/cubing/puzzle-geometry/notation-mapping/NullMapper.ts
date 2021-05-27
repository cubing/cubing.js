import type { Move } from "../../alg";
import type { NotationMapper } from "./NotationMapper";

export class NullMapper implements NotationMapper {
  public notationToInternal(move: Move): Move | null {
    return move;
  }

  public notationToExternal(move: Move): Move | null {
    return move;
  }
}
