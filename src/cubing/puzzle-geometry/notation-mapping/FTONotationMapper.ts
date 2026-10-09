import { Move, QuantumMove } from "../../alg/index.ts";
import type { FaceNameSwizzler } from "../FaceNameSwizzler.ts";
import type { NotationMapper } from "./NotationMapper.ts";

export class FTONotationMapper implements NotationMapper {
  private child: NotationMapper;
  private sw: FaceNameSwizzler;
  constructor(child: NotationMapper, sw: FaceNameSwizzler) {
    this.child = child;
    this.sw = sw;
  }

  public notationToInternal(move: Move): Move | null {
    if (
      move.family === "T" &&
      move.innerLayer === undefined &&
      move.outerLayer === undefined
    ) {
      return new Move(
        new QuantumMove("FLRv", move.innerLayer, move.outerLayer),
        move.amount,
      );
    } else {
      const r = this.child.notationToInternal(move);
      return r;
    }
  }

  // we never rewrite click moves to these moves.
  public notationToExternal(move: Move): Move | null {
    let fam = move.family;
    if (fam.length > 0 && fam[fam.length - 1] === "v") {
      fam = fam.substring(0, fam.length - 1);
    }
    if (this.sw.spinmatch(fam, "FLUR")) {
      return new Move(
        new QuantumMove("T", move.innerLayer, move.outerLayer),
        move.amount,
      );
    }
    return this.child.notationToExternal(move);
  }
}
