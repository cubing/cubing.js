import { Alg, Turn } from "../alg";
import { QuantumTurn } from "../alg/units/leaves/Turn";
import { KPuzzleDefinition, Transformation } from "./definition_types";
import { MoveNotation } from "./move_notation";
import {
  combineTransformations,
  identityTransformation,
  multiplyTransformations,
} from "./transformations";

// TODO: Move other helpers into the definition.
export function transformationForMoveQuantum(
  def: KPuzzleDefinition,
  moveQuantum: QuantumTurn,
): Transformation {
  const transformation = getNotationLayer(def).lookupMove(
    new Turn(moveQuantum), // TODO
  );
  if (!transformation) {
    throw new Error("Unknown move: " + moveQuantum.toString());
  }
  return transformation;
}

// TODO: Move other helpers into the definition.
export function transformationForMove(
  def: KPuzzleDefinition,
  move: Turn,
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

  public lookupMove(move: Turn): Transformation | undefined {
    const key = move.toString();
    let r: Transformation | undefined = this.cache[key];
    if (r) {
      return r;
    }
    const quantumKey = move.quantum.toString();
    r = this.def.moves[quantumKey];
    if (r) {
      r = multiplyTransformations(this.def, r, move.effectiveAmount);
      this.cache[key] = r;
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

  public applyMove(move: Turn): void {
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
