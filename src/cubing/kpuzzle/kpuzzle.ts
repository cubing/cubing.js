import { BlockMove, blockMoveToString, expand, Sequence } from "../alg";
import { KPuzzleDefinition, Transformation } from "./definition_types";
import { Multiply, IdentityTransformation, Combine } from "./transformations";
import { MoveNotation } from "./move_notation";

// TODO: Move other helpers into the definition.
export function stateForBlockMove(
  def: KPuzzleDefinition,
  blockMove: BlockMove,
): Transformation {
  const move = getNotationLayer(def).lookupMove(blockMove);
  if (!move) {
    throw new Error("Unknown move: " + blockMoveToString(blockMove));
  }
  return move;
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

  public lookupMove(move: BlockMove): Transformation | undefined {
    const key = blockMoveToString(move);
    let r: Transformation | undefined = this.cache[key];
    if (r) {
      return r;
    }
    const baseMove = new BlockMove(
      move.outerLayer,
      move.innerLayer,
      move.family,
      1,
    );
    const baseKey = blockMoveToString(baseMove);
    r = this.def.moves[baseKey];
    if (r) {
      r = Multiply(this.def, r, move.amount);
      this.cache[key] = r;
    }
    return r;
  }
}

export class KPuzzle {
  public state: Transformation;
  constructor(public definition: KPuzzleDefinition) {
    this.state = IdentityTransformation(definition);
  }

  public reset(): void {
    this.state = IdentityTransformation(this.definition);
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

  public applyBlockMove(blockMove: BlockMove): void {
    this.state = Combine(
      this.definition,
      this.state,
      stateForBlockMove(this.definition, blockMove),
    );
  }

  public applyAlg(a: Sequence): void {
    // TODO: Iterator instead of full expansion.
    for (const move of expand(a).nestedUnits as BlockMove[]) {
      this.applyBlockMove(move);
    }
  }
  // TODO: Implement
  // parseState(): this {}

  // TODO: Alg parsing

  // TODO: Implement.
  // invert(): this {}
}
