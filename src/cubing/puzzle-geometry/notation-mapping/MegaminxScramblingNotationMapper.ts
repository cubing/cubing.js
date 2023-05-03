// Sits on top of a (possibly null) notation mapper, and

import { Move, QuantumMove } from "../../alg";
import type { NotationMapper } from "./NotationMapper";

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

        // TODO: Figure out if `cubing/alg` should parse `R++` to a family of `R++`.
        if (move.family === "R_PLUSPLUS_") {
          return new Move(new QuantumMove("L", 3, 2), -2 * move.amount);
        } else if (move.family === "D_PLUSPLUS_") {
          return new Move(new QuantumMove("U", 3, 2), -2 * move.amount);
        }
      }
      if (move.family === "y") {
        return new Move("Uv", move.amount);
      }
      if (move.family === "x" && Math.abs(move.amount) === 2) {
        return new Move("ERv", move.amount / 2);
      }
    }
    return this.child.notationToInternal(move);
  }

  // we never rewrite click moves to these moves.
  public notationToExternal(move: Move): Move | null {
    if (move.family === "ERv" && Math.abs(move.amount) === 1) {
      return new Move(
        new QuantumMove("x", move.innerLayer, move.outerLayer),
        move.amount * 2,
      );
    }
    if (move.family === "ILv" && Math.abs(move.amount) === 1) {
      return new Move(
        new QuantumMove("x", move.innerLayer, move.outerLayer),
        -move.amount * 2,
      );
    }
    if (move.family === "Uv") {
      return new Move(
        new QuantumMove("y", move.innerLayer, move.outerLayer),
        move.amount,
      );
    }
    if (move.family === "Dv") {
      return new Move("y", -move.amount);
    }
    return this.child.notationToExternal(move);
  }
}
