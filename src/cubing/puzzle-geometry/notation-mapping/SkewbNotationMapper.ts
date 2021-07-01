import { Move, QuantumMove } from "../../alg";
import type { FaceNameSwizzler } from "../FaceNameSwizzler";
import type { NotationMapper } from "./NotationMapper";

const skewbFamilyMap: Record<string, string> = {
  U: "UBL",
  UL: "ULF",
  F: "UFR",
  UR: "URB",
  B: "DBL",
  D: "DFR",
  L: "DLF",
  R: "DRB",
};

const skewbExternalQuantumY = new QuantumMove("y");
const skewbInternalQuantumY = new QuantumMove("Dv");

export class SkewbNotationMapper implements NotationMapper {
  constructor(private child: FaceNameSwizzler) {}

  public notationToInternal(move: Move): Move | null {
    if (move.innerLayer || move.outerLayer) {
      return null;
    }
    const newFamily = skewbFamilyMap[move.family];
    if (newFamily) {
      return new Move(
        new QuantumMove(newFamily, move.outerLayer, move.innerLayer),
        move.amount,
      );
    }
    if (skewbExternalQuantumY.isIdentical(move.quantum)) {
      return new Move(skewbInternalQuantumY, -move.amount);
    }
    return null;
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
  }

  // we never rewrite click moves to these moves.
  public notationToExternal(move: Move): Move | null {
    for (const [external, internal] of Object.entries(skewbFamilyMap)) {
      if (this.child.spinmatch(move.family, internal)) {
        return new Move(
          new QuantumMove(external, move.innerLayer, move.outerLayer),
          move.amount,
        );
      }
    }
    if (skewbInternalQuantumY.isIdentical(move.quantum)) {
      return new Move(skewbExternalQuantumY, -move.amount);
    }
    return null;
    /*
       *   See (1) above.
       *
    if (move.family === "Rv") {
      return new BlockMove(move.outerLayer, move.innerLayer, "x", move.amount);
    } else if (move.family === "Uv") {
      return new BlockMove(move.outerLayer, move.innerLayer, "y", move.amount);
    } else if (move.family === "Fv") {
      return new BlockMove(move.outerLayer, move.innerLayer, "z", move.amount);
       */
    // } else {
    //   return null;
    // }
  }
}
