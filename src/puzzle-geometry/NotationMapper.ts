import { FaceNameSwizzler } from "./FaceNameSwizzler";
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

export class NxNxNCubeMapper implements NotationMapper {
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

// face renaming mapper.  Accepts two face name remappers.  We
// work between the two.

export class FaceRenamingMapper implements NotationMapper {
  constructor(
    public internalNames: FaceNameSwizzler,
    public externalNames: FaceNameSwizzler,
  ) {}

  // TODO:  consider putting a cache in front of this
  public convertString(
    grip: string,
    a: FaceNameSwizzler,
    b: FaceNameSwizzler,
  ): string {
    let suffix = "";
    if ((grip.endsWith("v") || grip.endsWith("v")) && grip <= "_") {
      suffix = grip.slice(grip.length - 1);
      grip = grip.slice(0, grip.length - 1);
    }
    const upper = grip.toUpperCase();
    let isLowerCase = false;
    if (grip !== upper) {
      isLowerCase = true;
      grip = upper;
    }
    grip = b.joinByFaceIndices(a.splitByFaceNames(grip));
    if (isLowerCase) {
      grip = grip.toLowerCase();
    }
    return grip + suffix;
  }

  public convert(
    mv: BlockMove,
    a: FaceNameSwizzler,
    b: FaceNameSwizzler,
  ): BlockMove {
    const grip = mv.family;
    const ngrip = this.convertString(grip, a, b);
    if (grip === ngrip) {
      return mv;
    } else {
      return new BlockMove(mv.outerLayer, mv.innerLayer, ngrip, mv.amount);
    }
  }

  public notationToInternal(mv: BlockMove): BlockMove {
    const r = this.convert(mv, this.externalNames, this.internalNames);
    return r;
  }

  public notationToExternal(mv: BlockMove): BlockMove {
    return this.convert(mv, this.internalNames, this.externalNames);
  }
}

// Sits on top of a (possibly null) notation mapper, and
// adds R++/R--/D++/D-- notation mapping.
export class MegaminxScramblingNotationMapper implements NotationMapper {
  constructor(private child: NotationMapper) {}

  public notationToInternal(mv: BlockMove): BlockMove {
    if (
      mv.innerLayer === undefined &&
      mv.outerLayer === undefined &&
      mv.amount === 1
    ) {
      if (mv.family === "R++") {
        return new BlockMove(2, 3, "L", -1);
      } else if (mv.family === "R--") {
        return new BlockMove(2, 3, "L", 1);
      } else if (mv.family === "U++") {
        return new BlockMove(2, 3, "U", -1);
      } else if (mv.family === "U--") {
        return new BlockMove(2, 3, "U", 1);
      }
    }
    return this.child.notationToInternal(mv);
  }

  // we never rewrite click moves to these moves.
  public notationToExternal(mv: BlockMove): BlockMove {
    return this.child.notationToExternal(mv);
  }
}
