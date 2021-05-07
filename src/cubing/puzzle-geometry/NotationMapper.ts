import type { FaceNameSwizzler } from "./FaceNameSwizzler";
import { Move, QuantumMove } from "../alg";

export interface NotationMapper {
  notationToInternal(move: Move): Move | null;
  notationToExternal(move: Move): Move | null;
}

export class NullMapper implements NotationMapper {
  public notationToInternal(move: Move): Move {
    return move;
  }

  public notationToExternal(move: Move): Move {
    return move;
  }
}

function negate(family: string, v: number): Move {
  return new Move(family, -(v ?? 1));
}

export class NxNxNCubeMapper implements NotationMapper {
  constructor(public slices: number) {}

  public notationToInternal(move: Move): Move {
    const grip = move.family;
    if (!move.innerLayer && !move.outerLayer) {
      if (grip === "x") {
        move = new Move("Rv", move.amount);
      } else if (grip === "y") {
        move = new Move("Uv", move.amount);
      } else if (grip === "z") {
        move = new Move("Fv", move.amount);
      }
      if ((this.slices & 1) === 1) {
        if (grip === "E") {
          move = new Move(
            new QuantumMove("D", (this.slices + 1) / 2),
            move.amount,
          );
        } else if (grip === "M") {
          move = new Move(
            new QuantumMove("L", (this.slices + 1) / 2),
            move.amount,
          );
        } else if (grip === "S") {
          move = new Move(
            new QuantumMove("F", (this.slices + 1) / 2),
            move.amount,
          );
        }
      }
      if (this.slices > 2) {
        if (grip === "e") {
          move = new Move(
            new QuantumMove("D", this.slices - 1, 2),
            move.amount,
          );
        } else if (grip === "m") {
          move = new Move(
            new QuantumMove("L", this.slices - 1, 2),
            move.amount,
          );
        } else if (grip === "s") {
          move = new Move(
            new QuantumMove("F", this.slices - 1, 2),
            move.amount,
          );
        }
      }
    }
    return move;
  }

  // do we want to map slice moves to E/M/S instead of 2U/etc.?
  public notationToExternal(move: Move): Move {
    const grip = move.family;
    if (!move.innerLayer && !move.outerLayer) {
      if (grip === "Rv") {
        return new Move("x", move.amount);
      } else if (grip === "Uv") {
        return new Move("y", move.amount);
      } else if (grip === "Fv") {
        return new Move("z", move.amount);
      } else if (grip === "Lv") {
        return negate("x", move.amount);
      } else if (grip === "Dv") {
        return negate("y", move.amount);
      } else if (grip === "Bv") {
        return negate("z", move.amount);
      }
    }
    return move;
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

  public convert(move: Move, a: FaceNameSwizzler, b: FaceNameSwizzler): Move {
    const grip = move.family;
    const ngrip = this.convertString(grip, a, b);
    if (grip === ngrip) {
      return move;
    } else {
      return new Move(
        new QuantumMove(ngrip, move.innerLayer, move.outerLayer),
        move.amount,
      );
    }
  }

  public notationToInternal(move: Move): Move {
    const r = this.convert(move, this.externalNames, this.internalNames);
    return r;
  }

  public notationToExternal(move: Move): Move {
    return this.convert(move, this.internalNames, this.externalNames);
  }
}

// Sits on top of a (possibly null) notation mapper, and
// adds R++/R--/D++/D-- notation mapping.
export class MegaminxScramblingNotationMapper implements NotationMapper {
  constructor(private child: NotationMapper) {}

  public notationToInternal(move: Move): Move | null {
    if (move.innerLayer === undefined && move.outerLayer === undefined) {
      if (Math.abs(move.amount) === 1) {
        if (move.family === "R++") {
          return new Move(new QuantumMove("L", 3, 2), -2 * move.amount);
        } else if (move.family === "R--") {
          return new Move(new QuantumMove("L", 3, 2), 2 * move.amount);
        } else if (move.family === "D++") {
          return new Move(new QuantumMove("U", 3, 2), -2 * move.amount);
        } else if (move.family === "D--") {
          return new Move(new QuantumMove("U", 3, 2), 2 * move.amount);
        }
      }
      if (move.family === "y") {
        return new Move("Uv", move.amount);
      }
    }
    return this.child.notationToInternal(move);
  }

  // we never rewrite click moves to these moves.
  public notationToExternal(move: Move): Move | null {
    if (move.family === "Uv") {
      return new Move(
        new QuantumMove("y", move.innerLayer, move.outerLayer),
        move.amount,
      );
    }
    if (move.family === "Dv") {
      return negate("y", move.amount);
    }
    return this.child.notationToExternal(move);
  }
}

export class SkewbNotationMapper implements NotationMapper {
  constructor(private child: FaceNameSwizzler) {}

  public notationToInternal(move: Move): Move | null {
    if (move.innerLayer || move.outerLayer) {
      return null;
    }
    if (move.family === "F") {
      return new Move(
        new QuantumMove("DFR", move.outerLayer, move.innerLayer),
        move.amount,
      );
    } else if (move.family === "R") {
      return new Move(
        new QuantumMove("DBR", move.outerLayer, move.innerLayer),
        move.amount,
      );
    } else if (move.family === "L") {
      return new Move(
        new QuantumMove("DFL", move.outerLayer, move.innerLayer),
        move.amount,
      );
    } else if (move.family === "B") {
      return new Move(
        new QuantumMove("DBL", move.outerLayer, move.innerLayer),
        move.amount,
      );
      /*
       *   (1) We are not including x/y/z in Skewb; they aren't WCA notation and
       *   it's unclear anyone needs them for reconstructions.
       *
    } else if (move.family === "x") {
      return new BlockMove(move.outerLayer, move.innerLayer, "Rv", move.amount);
    } else if (move.family === "y") {
      return new BlockMove(move.outerLayer, move.innerLayer, "Uv", move.amount);
    } else if (move.family === "z") {
      return new BlockMove(move.outerLayer, move.innerLayer, "Fv", move.amount);
       */
    } else {
      return null;
    }
  }

  // we never rewrite click moves to these moves.
  public notationToExternal(move: Move): Move | null {
    if (this.child.spinmatch(move.family, "DFR")) {
      return new Move(
        new QuantumMove("F", move.innerLayer, move.outerLayer),
        move.amount,
      );
    } else if (this.child.spinmatch(move.family, "DRB")) {
      return new Move(
        new QuantumMove("R", move.innerLayer, move.outerLayer),
        move.amount,
      );
    } else if (this.child.spinmatch(move.family, "DFL")) {
      return new Move(
        new QuantumMove("L", move.innerLayer, move.outerLayer),
        move.amount,
      );
    } else if (this.child.spinmatch(move.family, "DBL")) {
      return new Move(
        new QuantumMove("B", move.innerLayer, move.outerLayer),
        move.amount,
      );
      /*
       *   See (1) above.
       *
    } else if (move.family === "Rv") {
      return new BlockMove(move.outerLayer, move.innerLayer, "x", move.amount);
    } else if (move.family === "Uv") {
      return new BlockMove(move.outerLayer, move.innerLayer, "y", move.amount);
    } else if (move.family === "Fv") {
      return new BlockMove(move.outerLayer, move.innerLayer, "z", move.amount);
       */
    } else {
      return null;
    }
  }
}

export class PyraminxNotationMapper implements NotationMapper {
  constructor(private child: FaceNameSwizzler) {}

  public notationToInternal(move: Move): Move | null {
    if (move.innerLayer || move.outerLayer) {
      return null;
    }
    if (move.family === "U") {
      return new Move(
        new QuantumMove("flr", move.innerLayer, move.outerLayer),
        move.amount,
      );
    } else if (move.family === "R") {
      return new Move(
        new QuantumMove("fld", move.innerLayer, move.outerLayer),
        move.amount,
      );
    } else if (move.family === "L") {
      return new Move(
        new QuantumMove("frd", move.innerLayer, move.outerLayer),
        move.amount,
      );
    } else if (move.family === "B") {
      return new Move(
        new QuantumMove("dlr", move.innerLayer, move.outerLayer),
        move.amount,
      );
    } else if (move.family === "u") {
      return new Move(
        new QuantumMove("FLR", move.innerLayer, move.outerLayer),
        move.amount,
      );
    } else if (move.family === "r") {
      return new Move(
        new QuantumMove("FLD", move.innerLayer, move.outerLayer),
        move.amount,
      );
    } else if (move.family === "l") {
      return new Move(
        new QuantumMove("FRD", move.innerLayer, move.outerLayer),
        move.amount,
      );
    } else if (move.family === "b") {
      return new Move(
        new QuantumMove("DLR", move.innerLayer, move.outerLayer),
        move.amount,
      );
    } else if (move.family === "y") {
      return negate("Dv", move.amount);
    } else {
      return null;
    }
  }

  // we never rewrite click moves to these moves.
  public notationToExternal(move: Move): Move | null {
    if (move.family === move.family.toLowerCase()) {
      const fam = move.family.toUpperCase();
      if (this.child.spinmatch(fam, "FLR")) {
        return new Move(
          new QuantumMove("U", move.innerLayer, move.outerLayer),
          move.amount,
        );
      } else if (this.child.spinmatch(fam, "FLD")) {
        return new Move(
          new QuantumMove("R", move.innerLayer, move.outerLayer),
          move.amount,
        );
      } else if (this.child.spinmatch(fam, "FRD")) {
        return new Move(
          new QuantumMove("L", move.innerLayer, move.outerLayer),
          move.amount,
        );
      } else if (this.child.spinmatch(fam, "DLR")) {
        return new Move(
          new QuantumMove("B", move.innerLayer, move.outerLayer),
          move.amount,
        );
      }
    }
    if (move.family === move.family.toUpperCase()) {
      if (this.child.spinmatch(move.family, "FLR")) {
        return new Move(
          new QuantumMove("u", move.innerLayer, move.outerLayer),
          move.amount,
        );
      } else if (this.child.spinmatch(move.family, "FLD")) {
        return new Move(
          new QuantumMove("r", move.innerLayer, move.outerLayer),
          move.amount,
        );
      } else if (this.child.spinmatch(move.family, "FRD")) {
        return new Move(
          new QuantumMove("l", move.innerLayer, move.outerLayer),
          move.amount,
        );
      } else if (this.child.spinmatch(move.family, "DLR")) {
        return new Move(
          new QuantumMove("b", move.innerLayer, move.outerLayer),
          move.amount,
        );
      }
    }
    if (move.family === "Dv") {
      return negate("y", move.amount);
    } else {
      return null;
    }
  }
}

export class FTONotationMapper implements NotationMapper {
  constructor(private child: NotationMapper, private sw: FaceNameSwizzler) {}

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
