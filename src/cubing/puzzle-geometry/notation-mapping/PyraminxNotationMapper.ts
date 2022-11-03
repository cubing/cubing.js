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
  D: "D",
  F: "F",
  BL: "L",
  BR: "R",
};
const tetraminxFamilyMap: Record<string, string> = {
  U: "FRL",
  L: "FLD",
  R: "FDR",
  B: "DLR",
  u: "frl",
  l: "fld",
  r: "fdr",
  b: "dlr",
  Uv: "FRLv",
  Lv: "FLDv",
  Rv: "FDRv",
  Bv: "DLRv",
  D: "D",
  F: "F",
  BL: "L",
  BR: "R",
  d: "d",
  f: "f",
  bl: "l",
  br: "r",
};

const pyraminxFamilyMapWCA: Record<string, string> = {
  U: "FRL",
  L: "FLD",
  R: "FDR",
  B: "DLR",
};

const pyraminxExternalQuantumY = new QuantumMove("y");
const pyraminxInternalQuantumY = new QuantumMove("Dv");

export class PyraminxNotationMapper implements NotationMapper {
  protected wcaHack: boolean = false;
  map: Record<string, string> = pyraminxFamilyMap;

  constructor(private child: FaceNameSwizzler) {}

  public notationToInternal(move: Move): Move | null {
    if (this.wcaHack && move.innerLayer === 2 && move.outerLayer === null) {
      const newFamilyWCA = pyraminxFamilyMapWCA[move.family];
      if (newFamilyWCA) {
        return new Move(
          new QuantumMove(newFamilyWCA, move.innerLayer, move.outerLayer),
          move.amount,
        );
      }
    }
    const newFamily = this.map[move.family];

    if (newFamily) {
      return new Move(
        new QuantumMove(newFamily, move.innerLayer, move.outerLayer),
        move.amount,
      );
    } else if (pyraminxExternalQuantumY.isIdentical(move.quantum)) {
      return new Move(pyraminxInternalQuantumY, -move.amount);
    } else {
      return null;
    }
  }

  // we never rewrite click moves to these moves.
  public notationToExternal(move: Move): Move | null {
    if (this.wcaHack && move.innerLayer === 2 && move.outerLayer === null) {
      for (const [external, internal] of Object.entries(pyraminxFamilyMapWCA)) {
        if (this.child.spinmatch(move.family, internal)) {
          return new Move(
            new QuantumMove(external, move.innerLayer, move.outerLayer),
            move.amount,
          );
        }
      }
    }
    for (const [external, internal] of Object.entries(this.map)) {
      if (this.child.spinmatch(move.family, internal)) {
        return new Move(
          new QuantumMove(external, move.innerLayer, move.outerLayer),
          move.amount,
        );
      }
    }
    if (pyraminxInternalQuantumY.isIdentical(move.quantum)) {
      return new Move(pyraminxExternalQuantumY, -move.amount);
    } else {
      return null;
    }
  }
}

export class TetraminxNotationMapper extends PyraminxNotationMapper {
  protected override wcaHack = true;

  constructor(child: FaceNameSwizzler) {
    super(child);
    this.map = tetraminxFamilyMap;
  }
}
