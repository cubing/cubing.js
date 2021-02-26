import { FaceNameSwizzler } from "./FaceNameSwizzler";
import { PGVendoredTurn, PGVendoredQuantumTurn } from "./interfaces";

export interface NotationMapper {
  notationToInternal(turn: PGVendoredTurn): PGVendoredTurn | null;
  notationToExternal(turn: PGVendoredTurn): PGVendoredTurn | null;
}

export class NullMapper implements NotationMapper {
  public notationToInternal(turn: PGVendoredTurn): PGVendoredTurn {
    return turn;
  }

  public notationToExternal(turn: PGVendoredTurn): PGVendoredTurn {
    return turn;
  }
}

function negate(family: string, v: number | undefined): PGVendoredTurn {
  if (v === undefined) {
    v = -1;
  } else if (v === -1) {
    v = undefined;
  } else {
    v = -v;
  }
  return new PGVendoredTurn(family, v);
}

export class NxNxNCubeMapper implements NotationMapper {
  constructor(public slices: number) {}

  public notationToInternal(turn: PGVendoredTurn): PGVendoredTurn {
    const grip = turn.family;
    if (!turn.innerLayer && !turn.outerLayer) {
      if (grip === "x") {
        turn = new PGVendoredTurn("Rv", turn.effectiveAmount);
      } else if (grip === "y") {
        turn = new PGVendoredTurn("Uv", turn.effectiveAmount);
      } else if (grip === "z") {
        turn = new PGVendoredTurn("Fv", turn.effectiveAmount);
      }
      if ((this.slices & 1) === 1) {
        if (grip === "E") {
          turn = new PGVendoredTurn(
            new PGVendoredQuantumTurn("D", (this.slices + 1) / 2),
            turn.effectiveAmount,
          );
        } else if (grip === "M") {
          turn = new PGVendoredTurn(
            new PGVendoredQuantumTurn("L", (this.slices + 1) / 2),
            turn.effectiveAmount,
          );
        } else if (grip === "S") {
          turn = new PGVendoredTurn(
            new PGVendoredQuantumTurn("F", (this.slices + 1) / 2),
            turn.effectiveAmount,
          );
        }
      }
      if (this.slices > 2) {
        if (grip === "e") {
          turn = new PGVendoredTurn(
            new PGVendoredQuantumTurn("D", this.slices - 1, 2),
            turn.effectiveAmount,
          );
        } else if (grip === "m") {
          turn = new PGVendoredTurn(
            new PGVendoredQuantumTurn("L", this.slices - 1, 2),
            turn.effectiveAmount,
          );
        } else if (grip === "s") {
          turn = new PGVendoredTurn(
            new PGVendoredQuantumTurn("F", this.slices - 1, 2),
            turn.effectiveAmount,
          );
        }
      }
    }
    return turn;
  }

  // do we want to map slice turns to E/M/S instead of 2U/etc.?
  public notationToExternal(turn: PGVendoredTurn): PGVendoredTurn {
    const grip = turn.family;
    if (!turn.innerLayer && !turn.outerLayer) {
      if (grip === "Rv") {
        return new PGVendoredTurn("x", turn.effectiveAmount);
      } else if (grip === "Uv") {
        return new PGVendoredTurn("y", turn.effectiveAmount);
      } else if (grip === "Fv") {
        return new PGVendoredTurn("z", turn.effectiveAmount);
      } else if (grip === "Lv") {
        return negate("x", turn.effectiveAmount);
      } else if (grip === "Dv") {
        return negate("y", turn.effectiveAmount);
      } else if (grip === "Bv") {
        return negate("z", turn.effectiveAmount);
      }
    }
    return turn;
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
    turn: PGVendoredTurn,
    a: FaceNameSwizzler,
    b: FaceNameSwizzler,
  ): PGVendoredTurn {
    const grip = turn.family;
    const ngrip = this.convertString(grip, a, b);
    if (grip === ngrip) {
      return turn;
    } else {
      return new PGVendoredTurn(
        new PGVendoredQuantumTurn(ngrip, turn.innerLayer, turn.outerLayer),
        turn.effectiveAmount,
      );
    }
  }

  public notationToInternal(turn: PGVendoredTurn): PGVendoredTurn {
    const r = this.convert(turn, this.externalNames, this.internalNames);
    return r;
  }

  public notationToExternal(turn: PGVendoredTurn): PGVendoredTurn {
    return this.convert(turn, this.internalNames, this.externalNames);
  }
}

// Sits on top of a (possibly null) notation mapper, and
// adds R++/R--/D++/D-- notation mapping.
export class MegaminxScramblingNotationMapper implements NotationMapper {
  constructor(private child: NotationMapper) {}

  public notationToInternal(turn: PGVendoredTurn): PGVendoredTurn | null {
    if (turn.innerLayer === undefined && turn.outerLayer === undefined) {
      if (Math.abs(turn.effectiveAmount) === 1) {
        if (turn.family === "R++") {
          return new PGVendoredTurn(
            new PGVendoredQuantumTurn("L", 3, 2),
            -2 * turn.effectiveAmount,
          );
        } else if (turn.family === "R--") {
          return new PGVendoredTurn(
            new PGVendoredQuantumTurn("L", 3, 2),
            2 * turn.effectiveAmount,
          );
        } else if (turn.family === "D++") {
          return new PGVendoredTurn(
            new PGVendoredQuantumTurn("U", 3, 2),
            -2 * turn.effectiveAmount,
          );
        } else if (turn.family === "D--") {
          return new PGVendoredTurn(
            new PGVendoredQuantumTurn("U", 3, 2),
            2 * turn.effectiveAmount,
          );
        }
      }
      if (turn.family === "y") {
        return new PGVendoredTurn("Uv", turn.effectiveAmount);
      }
    }
    return this.child.notationToInternal(turn);
  }

  // we never rewrite click turns to these turns.
  public notationToExternal(turn: PGVendoredTurn): PGVendoredTurn | null {
    if (turn.family === "Uv") {
      return new PGVendoredTurn(
        new PGVendoredQuantumTurn("y", turn.innerLayer, turn.outerLayer),
        turn.effectiveAmount,
      );
    }
    if (turn.family === "Dv") {
      return negate("y", turn.effectiveAmount);
    }
    return this.child.notationToExternal(turn);
  }
}

export class SkewbNotationMapper implements NotationMapper {
  constructor(private child: FaceNameSwizzler) {}

  public notationToInternal(turn: PGVendoredTurn): PGVendoredTurn | null {
    if (turn.innerLayer || turn.outerLayer) {
      return null;
    }
    if (turn.family === "F") {
      return new PGVendoredTurn(
        new PGVendoredQuantumTurn("DFR", turn.outerLayer, turn.innerLayer),
        turn.effectiveAmount,
      );
    } else if (turn.family === "R") {
      return new PGVendoredTurn(
        new PGVendoredQuantumTurn("DBR", turn.outerLayer, turn.innerLayer),
        turn.effectiveAmount,
      );
    } else if (turn.family === "L") {
      return new PGVendoredTurn(
        new PGVendoredQuantumTurn("DFL", turn.outerLayer, turn.innerLayer),
        turn.effectiveAmount,
      );
    } else if (turn.family === "B") {
      return new PGVendoredTurn(
        new PGVendoredQuantumTurn("DBL", turn.outerLayer, turn.innerLayer),
        turn.effectiveAmount,
      );
      /*
       *   (1) We are not including x/y/z in Skewb; they aren't WCA notation and
       *   it's unclear anyone needs them for reconstructions.
       *
    } else if (turn.family === "x") {
      return new BlockTurn(turn.outerLayer, turn.innerLayer, "Rv", turn.amount);
    } else if (turn.family === "y") {
      return new BlockTurn(turn.outerLayer, turn.innerLayer, "Uv", turn.amount);
    } else if (turn.family === "z") {
      return new BlockTurn(turn.outerLayer, turn.innerLayer, "Fv", turn.amount);
       */
    } else {
      return null;
    }
  }

  // we never rewrite click turns to these turns.
  public notationToExternal(turn: PGVendoredTurn): PGVendoredTurn | null {
    if (this.child.spinmatch(turn.family, "DFR")) {
      return new PGVendoredTurn(
        new PGVendoredQuantumTurn("F", turn.innerLayer, turn.outerLayer),
        turn.effectiveAmount,
      );
    } else if (this.child.spinmatch(turn.family, "DRB")) {
      return new PGVendoredTurn(
        new PGVendoredQuantumTurn("R", turn.innerLayer, turn.outerLayer),
        turn.effectiveAmount,
      );
    } else if (this.child.spinmatch(turn.family, "DFL")) {
      return new PGVendoredTurn(
        new PGVendoredQuantumTurn("L", turn.innerLayer, turn.outerLayer),
        turn.effectiveAmount,
      );
    } else if (this.child.spinmatch(turn.family, "DBL")) {
      return new PGVendoredTurn(
        new PGVendoredQuantumTurn("B", turn.innerLayer, turn.outerLayer),
        turn.effectiveAmount,
      );
      /*
       *   See (1) above.
       *
    } else if (turn.family === "Rv") {
      return new BlockTurn(turn.outerLayer, turn.innerLayer, "x", turn.amount);
    } else if (turn.family === "Uv") {
      return new BlockTurn(turn.outerLayer, turn.innerLayer, "y", turn.amount);
    } else if (turn.family === "Fv") {
      return new BlockTurn(turn.outerLayer, turn.innerLayer, "z", turn.amount);
       */
    } else {
      return null;
    }
  }
}

export class PyraminxNotationMapper implements NotationMapper {
  constructor(private child: FaceNameSwizzler) {}

  public notationToInternal(turn: PGVendoredTurn): PGVendoredTurn | null {
    if (turn.innerLayer || turn.outerLayer) {
      return null;
    }
    if (turn.family === "U") {
      return new PGVendoredTurn(
        new PGVendoredQuantumTurn("flr", turn.innerLayer, turn.outerLayer),
        turn.effectiveAmount,
      );
    } else if (turn.family === "R") {
      return new PGVendoredTurn(
        new PGVendoredQuantumTurn("fld", turn.innerLayer, turn.outerLayer),
        turn.effectiveAmount,
      );
    } else if (turn.family === "L") {
      return new PGVendoredTurn(
        new PGVendoredQuantumTurn("frd", turn.innerLayer, turn.outerLayer),
        turn.effectiveAmount,
      );
    } else if (turn.family === "B") {
      return new PGVendoredTurn(
        new PGVendoredQuantumTurn("dlr", turn.innerLayer, turn.outerLayer),
        turn.effectiveAmount,
      );
    } else if (turn.family === "u") {
      return new PGVendoredTurn(
        new PGVendoredQuantumTurn("FLR", turn.innerLayer, turn.outerLayer),
        turn.effectiveAmount,
      );
    } else if (turn.family === "r") {
      return new PGVendoredTurn(
        new PGVendoredQuantumTurn("FLD", turn.innerLayer, turn.outerLayer),
        turn.effectiveAmount,
      );
    } else if (turn.family === "l") {
      return new PGVendoredTurn(
        new PGVendoredQuantumTurn("FRD", turn.innerLayer, turn.outerLayer),
        turn.effectiveAmount,
      );
    } else if (turn.family === "b") {
      return new PGVendoredTurn(
        new PGVendoredQuantumTurn("DLR", turn.innerLayer, turn.outerLayer),
        turn.effectiveAmount,
      );
    } else if (turn.family === "y") {
      return negate("Dv", turn.effectiveAmount);
    } else {
      return null;
    }
  }

  // we never rewrite click turns to these turns.
  public notationToExternal(turn: PGVendoredTurn): PGVendoredTurn | null {
    if (turn.family === turn.family.toLowerCase()) {
      const fam = turn.family.toUpperCase();
      if (this.child.spinmatch(fam, "FLR")) {
        return new PGVendoredTurn(
          new PGVendoredQuantumTurn("U", turn.innerLayer, turn.outerLayer),
          turn.effectiveAmount,
        );
      } else if (this.child.spinmatch(fam, "FLD")) {
        return new PGVendoredTurn(
          new PGVendoredQuantumTurn("R", turn.innerLayer, turn.outerLayer),
          turn.effectiveAmount,
        );
      } else if (this.child.spinmatch(fam, "FRD")) {
        return new PGVendoredTurn(
          new PGVendoredQuantumTurn("L", turn.innerLayer, turn.outerLayer),
          turn.effectiveAmount,
        );
      } else if (this.child.spinmatch(fam, "DLR")) {
        return new PGVendoredTurn(
          new PGVendoredQuantumTurn("B", turn.innerLayer, turn.outerLayer),
          turn.effectiveAmount,
        );
      }
    }
    if (turn.family === turn.family.toUpperCase()) {
      if (this.child.spinmatch(turn.family, "FLR")) {
        return new PGVendoredTurn(
          new PGVendoredQuantumTurn("u", turn.innerLayer, turn.outerLayer),
          turn.effectiveAmount,
        );
      } else if (this.child.spinmatch(turn.family, "FLD")) {
        return new PGVendoredTurn(
          new PGVendoredQuantumTurn("r", turn.innerLayer, turn.outerLayer),
          turn.effectiveAmount,
        );
      } else if (this.child.spinmatch(turn.family, "FRD")) {
        return new PGVendoredTurn(
          new PGVendoredQuantumTurn("l", turn.innerLayer, turn.outerLayer),
          turn.effectiveAmount,
        );
      } else if (this.child.spinmatch(turn.family, "DLR")) {
        return new PGVendoredTurn(
          new PGVendoredQuantumTurn("b", turn.innerLayer, turn.outerLayer),
          turn.effectiveAmount,
        );
      }
    }
    if (turn.family === "Dv") {
      return negate("y", turn.effectiveAmount);
    } else {
      return null;
    }
  }
}
