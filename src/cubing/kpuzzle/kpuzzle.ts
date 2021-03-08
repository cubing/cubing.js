import { Alg, Move } from "../alg";
import { MoveQuantum } from "../alg/units/leaves/Move";
import {
  KPuzzleDefinition,
  SerializedKPuzzleDefinition,
  SerializedTransformation,
  Transformation,
} from "./definition_types";
import { MoveNotation } from "./move_notation";
import {
  combineTransformations,
  identityTransformation,
  multiplyTransformations,
  SparseTransformation,
} from "./transformations";

// TODO: Move other helpers into the definition.
export function transformationForMoveQuantum(
  def: KPuzzleDefinition,
  moveQuantum: MoveQuantum,
): Transformation {
  const transformation = getNotationLayer(def).lookupMove(
    new Move(moveQuantum), // TODO
  );
  if (!transformation) {
    throw new Error("Unknown move: " + moveQuantum.toString());
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
      r = multiplyTransformations(this.def, r, move.effectiveAmount);
      r = new SparseTransformation(this.def, r);
      this.cache[key] = r;
    }
    return r;
  }
}

export function deserializeTransformation(
  trans: SerializedTransformation | Transformation,
): Transformation {
  if (trans.orbits) {
    return trans as Transformation;
  } else {
    return { orbits: trans } as Transformation;
  }
}
export function deserializeKPuzzleDefinition(
  def: KPuzzleDefinition | SerializedKPuzzleDefinition,
): KPuzzleDefinition {
  if (!def.startPieces.orbits) {
    const sdef = def as SerializedKPuzzleDefinition;
    return {
      name: sdef.name,
      orbits: sdef.orbits,
      startPieces: deserializeTransformation(sdef.startPieces),
      moves: Object.fromEntries(
        Object.entries(sdef.moves).map(([k, v]) => [
          k,
          deserializeTransformation(v),
        ]),
      ),
    };
  }
  return def as KPuzzleDefinition;
}

export class KPuzzle {
  public state: Transformation;
  public definition: KPuzzleDefinition;
  constructor(def: KPuzzleDefinition | SerializedKPuzzleDefinition) {
    this.definition = deserializeKPuzzleDefinition(def);
    this.state = identityTransformation(this.definition);
  }

  public reset(): void {
    this.state = identityTransformation(this.definition);
  }

  public serialize(): string {
    let output = "";
    for (const orbitName in this.definition.orbits) {
      output += orbitName + "\n";
      output += this.state.orbits[orbitName].permutation.join(" ") + "\n";
      output += this.state.orbits[orbitName].orientation.join(" ") + "\n";
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
