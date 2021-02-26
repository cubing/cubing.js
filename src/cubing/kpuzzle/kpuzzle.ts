import { Alg, Turn } from "../alg";
import { QuantumTurn } from "../alg/units/leaves/Turn";
import { KPuzzleDefinition, Transformation } from "./definition_types";
import { TurnNotation } from "./TurnNotation";
import {
  combineTransformations,
  identityTransformation,
  multiplyTransformations,
} from "./transformations";

// TODO: Turn other helpers into the definition.
export function transformationForTurnQuantum(
  def: KPuzzleDefinition,
  turnQuantum: QuantumTurn,
): Transformation {
  const transformation = getNotationLayer(def).lookupTurn(
    new Turn(turnQuantum), // TODO
  );
  if (!transformation) {
    throw new Error("Unknown turn: " + turnQuantum.toString());
  }
  return transformation;
}

// TODO: Turn other helpers into the definition.
export function transformationForTurn(
  def: KPuzzleDefinition,
  turn: Turn,
): Transformation {
  const transformation = getNotationLayer(def).lookupTurn(turn);
  if (!transformation) {
    throw new Error("Unknown turn: " + turn.toString());
  }
  return transformation;
}

export function getNotationLayer(def: KPuzzleDefinition): TurnNotation {
  if (!def.turnNotation) {
    def.turnNotation = new KPuzzleTurnNotation(def);
  }
  return def.turnNotation;
}

class KPuzzleTurnNotation implements TurnNotation {
  private cache: { [key: string]: Transformation } = {};
  constructor(public def: KPuzzleDefinition) {}

  public lookupTurn(turn: Turn): Transformation | undefined {
    const key = turn.toString();
    let r: Transformation | undefined = this.cache[key];
    if (r) {
      return r;
    }
    const quantumKey = turn.quantum.toString();
    r = this.def.turns[quantumKey];
    if (r) {
      r = multiplyTransformations(this.def, r, turn.effectiveAmount);
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

  public applyTurn(turn: Turn): void {
    this.state = combineTransformations(
      this.definition,
      this.state,
      transformationForTurn(this.definition, turn),
    );
  }

  public applyAlg(alg: Alg): void {
    // TODO: use indexer instead of full expansion.
    for (const turn of alg.experimentalLeafTurns()) {
      this.applyTurn(turn);
    }
  }
  // TODO: Implement
  // parseState(): this {}

  // TODO: Alg parsing

  // TODO: Implement.
  // invert(): this {}
}
