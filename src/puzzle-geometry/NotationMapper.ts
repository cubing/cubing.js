import { BlockMove } from "./interfaces";

export interface NotationMapper {
  notationToInternal(mv: BlockMove): BlockMove;
  notationToExternal(mv: BlockMove): BlockMove;
}

export class NullMapper implements NotationMapper {
  public notationToInternal(mv: BlockMove): BlockMove {
    return mv;
  }

  public notationToExternal(mv: BlockMove): BlockMove {
    return mv;
  }
}

export class NxNCubeMapper implements NotationMapper {
  constructor(public slices: number) {}

  public notationToInternal(mv: BlockMove): BlockMove {
    const grip = mv.family;
    if (!mv.innerLayer && !mv.outerLayer) {
      if (grip === "x") {
        mv = new BlockMove(undefined, undefined, "Rv", mv.amount);
      } else if (grip === "y") {
        mv = new BlockMove(undefined, undefined, "Uv", mv.amount);
      } else if (grip === "z") {
        mv = new BlockMove(undefined, undefined, "Fv", mv.amount);
      }
      if ((this.slices & 1) === 1) {
        if (grip === "E") {
          mv = new BlockMove(undefined, (this.slices + 1) / 2, "D", mv.amount);
        } else if (grip === "M") {
          mv = new BlockMove(undefined, (this.slices + 1) / 2, "L", mv.amount);
        } else if (grip === "S") {
          mv = new BlockMove(undefined, (this.slices + 1) / 2, "F", mv.amount);
        }
      }
      if (this.slices > 2) {
        if (grip === "e") {
          mv = new BlockMove(2, this.slices - 1, "D", mv.amount);
        } else if (grip === "m") {
          mv = new BlockMove(2, this.slices - 1, "L", mv.amount);
        } else if (grip === "s") {
          mv = new BlockMove(2, this.slices - 1, "F", mv.amount);
        }
      }
    }
    return mv;
  }

  // do we want to map slice moves to E/M/S instead of 2U/etc.?
  public notationToExternal(mv: BlockMove): BlockMove {
    const grip = mv.family;
    if (!mv.innerLayer && !mv.outerLayer) {
      if (grip === "Rv") {
        return new BlockMove(undefined, undefined, "x", mv.amount);
      } else if (grip === "Uv") {
        return new BlockMove(undefined, undefined, "y", mv.amount);
      } else if (grip === "Fv") {
        return new BlockMove(undefined, undefined, "z", mv.amount);
      } else if (grip === "Lv") {
        return this.negate("x", mv.amount);
      } else if (grip === "Dv") {
        return this.negate("y", mv.amount);
      } else if (grip === "Bv") {
        return this.negate("z", mv.amount);
      }
    }
    return mv;
  }

  private negate(family: string, v: number | undefined): BlockMove {
    if (v === undefined) {
      v = -1;
    } else if (v === -1) {
      v = undefined;
    } else {
      v = -v;
    }
    return new BlockMove(undefined, undefined, family, v);
  }
}

// face renaming mapper.  Accepts two lists of face names and
// makes things use the external face names externally and the
// internal face names internally.  Note that this does all
// swizzling/unswizzling based on the face names and their
// prefix-free-ness, and it handles all the underscores as well.

export class FaceRenamingMapper implements NotationMapper {
  constructor(public internalNames: string[], public externalNames: string[]) {}

  public notationToInternal(mv: BlockMove): BlockMove {
    return mv;
  }

  public notationToExternal(mv: BlockMove): BlockMove {
    return mv;
  }
}
