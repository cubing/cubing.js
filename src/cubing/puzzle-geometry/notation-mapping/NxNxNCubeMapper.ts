import { Move, QuantumMove } from "../../alg";
import type { NotationMapper } from "./NotationMapper";

export class NxNxNCubeMapper implements NotationMapper {
  constructor(public slices: number) {}

  public notationToInternal(move: Move): Move {
    const grip = move.family;
    if (!(move.innerLayer || move.outerLayer)) {
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
    if (!(move.innerLayer || move.outerLayer)) {
      if (grip === "Rv") {
        return new Move("x", move.amount);
      } else if (grip === "Uv") {
        return new Move("y", move.amount);
      } else if (grip === "Fv") {
        return new Move("z", move.amount);
      } else if (grip === "Lv") {
        return new Move("x", -move.amount);
      } else if (grip === "Dv") {
        return new Move("y", -move.amount);
      } else if (grip === "Bv") {
        return new Move("z", -move.amount);
      }
    }
    return move;
  }
}
