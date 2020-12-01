import { FaceNameSwizzler } from "./FaceNameSwizzler";
import { BlockMove } from "./interfaces";

export interface NotationMapper {
  notationToInternal(mv: BlockMove): BlockMove | null;
  notationToExternal(mv: BlockMove): BlockMove | null;
}

export class NullMapper implements NotationMapper {
  public notationToInternal(mv: BlockMove): BlockMove {
    return mv;
  }

  public notationToExternal(mv: BlockMove): BlockMove {
    return mv;
  }
}

function negate(family: string, v: number | undefined): BlockMove {
  if (v === undefined) {
    v = -1;
  } else if (v === -1) {
    v = undefined;
  } else {
    v = -v;
  }
  return new BlockMove(undefined, undefined, family, v);
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
        return negate("x", mv.amount);
      } else if (grip === "Dv") {
        return negate("y", mv.amount);
      } else if (grip === "Bv") {
        return negate("z", mv.amount);
      }
    }
    return mv;
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

  public notationToInternal(mv: BlockMove): BlockMove | null {
    if (mv.innerLayer === undefined && mv.outerLayer === undefined) {
      if (Math.abs(mv.amount) === 1) {
        if (mv.family === "R++") {
          return new BlockMove(2, 3, "L", -2 * mv.amount);
        } else if (mv.family === "R--") {
          return new BlockMove(2, 3, "L", 2 * mv.amount);
        } else if (mv.family === "D++") {
          return new BlockMove(2, 3, "U", -2 * mv.amount);
        } else if (mv.family === "D--") {
          return new BlockMove(2, 3, "U", 2 * mv.amount);
        }
      }
      if (mv.family === "y") {
        return new BlockMove(undefined, undefined, "Uv", mv.amount);
      }
    }
    return this.child.notationToInternal(mv);
  }

  // we never rewrite click moves to these moves.
  public notationToExternal(mv: BlockMove): BlockMove | null {
    if (mv.family === "Uv") {
      return new BlockMove(mv.innerLayer, mv.outerLayer, "y", mv.amount);
    }
    if (mv.family === "Dv") {
      return negate("y", mv.amount);
    }
    return this.child.notationToExternal(mv);
  }
}

export class SkewbNotationMapper implements NotationMapper {
  constructor(private child: FaceNameSwizzler) {}

  public notationToInternal(mv: BlockMove): BlockMove | null {
    if (mv.innerLayer || mv.outerLayer) {
      return null;
    }
    if (mv.family === "F") {
      return new BlockMove(mv.outerLayer, mv.innerLayer, "DFR", mv.amount);
    } else if (mv.family === "R") {
      return new BlockMove(mv.outerLayer, mv.innerLayer, "DBR", mv.amount);
    } else if (mv.family === "L") {
      return new BlockMove(mv.outerLayer, mv.innerLayer, "DFL", mv.amount);
    } else if (mv.family === "B") {
      return new BlockMove(mv.outerLayer, mv.innerLayer, "DBL", mv.amount);
      /*
       *   (1) We are not including x/y/z in Skewb; they aren't WCA notation and
       *   it's unclear anyone needs them for reconstructions.
       *
    } else if (mv.family === "x") {
      return new BlockMove(mv.outerLayer, mv.innerLayer, "Rv", mv.amount);
    } else if (mv.family === "y") {
      return new BlockMove(mv.outerLayer, mv.innerLayer, "Uv", mv.amount);
    } else if (mv.family === "z") {
      return new BlockMove(mv.outerLayer, mv.innerLayer, "Fv", mv.amount);
       */
    } else {
      return null;
    }
  }

  // we never rewrite click moves to these moves.
  public notationToExternal(mv: BlockMove): BlockMove | null {
    if (this.child.spinmatch(mv.family, "DFR")) {
      return new BlockMove(mv.outerLayer, mv.innerLayer, "F", mv.amount);
    } else if (this.child.spinmatch(mv.family, "DRB")) {
      return new BlockMove(mv.outerLayer, mv.innerLayer, "R", mv.amount);
    } else if (this.child.spinmatch(mv.family, "DFL")) {
      return new BlockMove(mv.outerLayer, mv.innerLayer, "L", mv.amount);
    } else if (this.child.spinmatch(mv.family, "DBL")) {
      return new BlockMove(mv.outerLayer, mv.innerLayer, "B", mv.amount);
      /*
       *   See (1) above.
       *
    } else if (mv.family === "Rv") {
      return new BlockMove(mv.outerLayer, mv.innerLayer, "x", mv.amount);
    } else if (mv.family === "Uv") {
      return new BlockMove(mv.outerLayer, mv.innerLayer, "y", mv.amount);
    } else if (mv.family === "Fv") {
      return new BlockMove(mv.outerLayer, mv.innerLayer, "z", mv.amount);
       */
    } else {
      return null;
    }
  }
}

export class PyraminxNotationMapper implements NotationMapper {
  constructor(private child: FaceNameSwizzler) {}

  public notationToInternal(mv: BlockMove): BlockMove | null {
    if (mv.innerLayer || mv.outerLayer) {
      return null;
    }
    if (mv.family === "U") {
      return new BlockMove(mv.outerLayer, mv.innerLayer, "flr", mv.amount);
    } else if (mv.family === "R") {
      return new BlockMove(mv.outerLayer, mv.innerLayer, "fld", mv.amount);
    } else if (mv.family === "L") {
      return new BlockMove(mv.outerLayer, mv.innerLayer, "frd", mv.amount);
    } else if (mv.family === "B") {
      return new BlockMove(mv.outerLayer, mv.innerLayer, "dlr", mv.amount);
    } else if (mv.family === "u") {
      return new BlockMove(mv.outerLayer, mv.innerLayer, "FLR", mv.amount);
    } else if (mv.family === "r") {
      return new BlockMove(mv.outerLayer, mv.innerLayer, "FLD", mv.amount);
    } else if (mv.family === "l") {
      return new BlockMove(mv.outerLayer, mv.innerLayer, "FRD", mv.amount);
    } else if (mv.family === "b") {
      return new BlockMove(mv.outerLayer, mv.innerLayer, "DLR", mv.amount);
    } else if (mv.family === "y") {
      return negate("Dv", mv.amount);
    } else {
      return null;
    }
  }

  // we never rewrite click moves to these moves.
  public notationToExternal(mv: BlockMove): BlockMove | null {
    if (mv.family === mv.family.toLowerCase()) {
      const fam = mv.family.toUpperCase();
      if (this.child.spinmatch(fam, "FLR")) {
        return new BlockMove(mv.outerLayer, mv.innerLayer, "U", mv.amount);
      } else if (this.child.spinmatch(fam, "FLD")) {
        return new BlockMove(mv.outerLayer, mv.innerLayer, "R", mv.amount);
      } else if (this.child.spinmatch(fam, "FRD")) {
        return new BlockMove(mv.outerLayer, mv.innerLayer, "L", mv.amount);
      } else if (this.child.spinmatch(fam, "DLR")) {
        return new BlockMove(mv.outerLayer, mv.innerLayer, "B", mv.amount);
      }
    }
    if (mv.family === mv.family.toUpperCase()) {
      if (this.child.spinmatch(mv.family, "FLR")) {
        return new BlockMove(mv.outerLayer, mv.innerLayer, "u", mv.amount);
      } else if (this.child.spinmatch(mv.family, "FLD")) {
        return new BlockMove(mv.outerLayer, mv.innerLayer, "r", mv.amount);
      } else if (this.child.spinmatch(mv.family, "FRD")) {
        return new BlockMove(mv.outerLayer, mv.innerLayer, "l", mv.amount);
      } else if (this.child.spinmatch(mv.family, "DLR")) {
        return new BlockMove(mv.outerLayer, mv.innerLayer, "b", mv.amount);
      }
    }
    if (mv.family === "Dv") {
      return negate("y", mv.amount);
    } else {
      return null;
    }
  }
}
