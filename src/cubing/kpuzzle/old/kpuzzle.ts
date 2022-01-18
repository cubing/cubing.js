import { Alg, Move } from "../../alg";
import type { QuantumMove } from "../../alg/units/leaves/Move";
import type { KPuzzleDefinition, Transformation } from "./definition_types";
import type { MoveNotation } from "./move_notation";
import {
  combineTransformations,
  identityTransformation,
  multiplyTransformations,
} from "./transformations";

// TODO: Move other helpers into the definition.
export function transformationForQuantumMove(
  def: KPuzzleDefinition,
  quantumMove: QuantumMove,
): Transformation {
  const transformation = getNotationLayer(def).lookupMove(
    new Move(quantumMove), // TODO
  );
  if (!transformation) {
    throw new Error("Unknown move: " + quantumMove.toString());
  }
  return transformation;
}

// TODO: Move other helpers into the definition.
export function transformationForMove(
  def: KPuzzleDefinition,
  move: Move,
): Transformation {
  const transformation = getNotationLayer(def).lookupMove(move);
  if (!transformation) {
    throw new Error("Unknown move: " + move.toString());
  }
  return transformation;
}

export function getNotationLayer(def: KPuzzleDefinition): MoveNotation {
  if (!def.moveNotation) {
    def.moveNotation = new KPuzzleMoveNotation(def);
  }
  return def.moveNotation;
}

class KPuzzleMoveNotation implements MoveNotation {
  private cache: { [key: string]: Transformation } = {};
  constructor(public def: KPuzzleDefinition) {}

  public lookupMove(move: Move): Transformation | undefined {
    const key = move.toString();
    let r: Transformation | undefined = this.cache[key];
    if (r) {
      return r;
    }
    const quantumKey = move.quantum.toString();
    r = this.def.moves[quantumKey];
    if (r) {
      r = multiplyTransformations(this.def, r, move.amount);
      this.cache[key] = r;
    } else {
      // Handle e.g. `y2` if `y2` is defined.
      // Note: this doesn't handle multiples.
      // TODO: Should this be defined in a special place in the KPuzzle def instead of mixed with normal moves?
      r = this.def.moves[move.toString()];
      if (r) {
        this.cache[key] = r;
      } else {
        // Handle e.g. `y2'` if `y2` is defined.
        // Note: this doesn't handle multiples.
        // TODO: Should this be defined in a special place in the KPuzzle def instead of mixed with normal moves?
        r = this.def.moves[move.invert().toString()];
        if (r) {
          r = multiplyTransformations(this.def, r, -1);
          this.cache[key] = r;
        }
      }
    }

    return r;
  }
}

export class KPuzzle {
  public state: Transformation;
  constructor(public definition: KPuzzleDefinition) {
    this.state = identityTransformation(definition);
  }

  public reset(): void {
    this.state = identityTransformation(this.definition);
  }

  public serialize(): string {
    let output = "";
    for (const orbitName in this.definition.orbits) {
      output += orbitName + "\n";
      output += this.state[orbitName].permutation.join(" ") + "\n";
      output += this.state[orbitName].orientation.join(" ") + "\n";
    }
    output = output.slice(0, output.length - 1); // Trim last newline.
    return output;
  }

  public applyMove(move: Move): void {
    this.state = combineTransformations(
      this.definition,
      this.state,
      transformationForMove(this.definition, move),
    );
  }

  public applyAlg(alg: Alg): void {
    // TODO: use indexer instead of full expansion.
    for (const move of alg.experimentalLeafMoves()) {
      this.applyMove(move);
    }
  }
  // TODO: Implement
  // parseState(): this {}

  // TODO: Alg parsing

  // TODO: Implement.
  // invert(): this {}
}
