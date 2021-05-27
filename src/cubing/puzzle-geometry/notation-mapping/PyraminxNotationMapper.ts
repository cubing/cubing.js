import { Move, QuantumMove } from "../../alg";
import type { FaceNameSwizzler } from "../FaceNameSwizzler";
import type { NotationMapper } from "./NotationMapper";

const pyraminxFamilyMap: Record<string, string> = {
  U: "frl",
  L: "fld",
  R: "fdr",
  B: "dlr",
  u: "FRL",
  l: "FLD",
  r: "FDR",
  b: "DLR",
  Uv: "FRLv",
  Lv: "FLDv",
  Rv: "FDRv",
  Bv: "DLRv",
};

const pyraminxFamilyMap3: Record<string, string> = {
  U: "FRL",
  L: "FLD",
  R: "FDR",
  B: "DLR",
};

const pyraminxExternalQuantumY = new QuantumMove("y");
const pyraminxInternalQuantumY = new QuantumMove("Dv");

// class QuantumMoveMapper {
//   #mapToInternal: Map<QuantumMove, QuantumMove> = new Map();
//   #mapToExternal: Map<QuantumMove, QuantumMove> = new Map();
//   constructor(toInternal: Record<string, string>) {
//     for (const [external, internal] of Object.entries(toInternal)) {
//       const externalQuantum = new QuantumMove(external);
//       const internalQuantum = new QuantumMove(internal);
//       this.#mapToInternal.set(externalQuantum, internalQuantum);
//       this.#mapToExternal.set(externalQuantum, internalQuantum);
//     }
//   }
// }

export class PyraminxNotationMapper implements NotationMapper {
  constructor(private child: FaceNameSwizzler) {}

  public notationToInternal(move: Move): Move | null {
    console.log(
      "move",
      move.toString(),
      move,
      move.innerLayer,
      move.outerLayer,
      move.family,
      move.innerLayer === 3 && !move.outerLayer,
    );
    if (move.innerLayer === 3 && !move.outerLayer) {
      console.log("Sdfsdfds");
      const newFamily3 = pyraminxFamilyMap3[move.family];
      console.log(
        move.family,
        { newFamily3 },
        new Move(
          new QuantumMove(newFamily3, move.innerLayer, move.outerLayer),
          move.amount,
        ),
        new Move(
          new QuantumMove(newFamily3, move.innerLayer, move.outerLayer),
          move.amount,
        ).toString(),
      );
      if (newFamily3) {
        return new Move(
          new QuantumMove(newFamily3, move.innerLayer, move.outerLayer),
          move.amount,
        );
      }
    }
    if (move.innerLayer || move.outerLayer) {
      return null;
    }
    const newFamily = pyraminxFamilyMap[move.family];

    if (newFamily) {
      return new Move(
        new QuantumMove(newFamily, move.innerLayer, move.outerLayer),
        move.amount,
      );
    } else if (pyraminxExternalQuantumY.isIdentical(move.quantum)) {
      console.log("sfdsf", pyraminxInternalQuantumY);
      return new Move(pyraminxInternalQuantumY, -move.amount);
    } else {
      return null;
    }
  }

  // we never rewrite click moves to these moves.
  public notationToExternal(move: Move): Move | null {
    console.log("split", this.child.splitByFaceNames(move.family));
    if (move.innerLayer === 3 && !move.outerLayer) {
      for (const [external, internal] of Object.entries(pyraminxFamilyMap3)) {
        if (this.child.spinmatch(move.family, internal)) {
          return new Move(
            new QuantumMove(external, move.innerLayer, move.outerLayer),
            move.amount,
          );
        }
      }
    }
    for (const [external, internal] of Object.entries(pyraminxFamilyMap)) {
      if (this.child.spinmatch(move.family, internal)) {
        return new Move(
          new QuantumMove(external, move.innerLayer, move.outerLayer),
          move.amount,
        );
      }
    }
    if (pyraminxInternalQuantumY.isIdentical(move.quantum)) {
      return new Move("y", -move.amount);
    } else {
      return null;
    }
  }
}
