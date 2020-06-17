import { BlockMove, blockMoveToString, expand, Sequence } from "../alg";
import { KPuzzleDefinition, Transformation } from "./definition_types";
import { MoveExpander } from "./move_expander";
import { Multiply, IdentityTransformation, Combine } from "./transformations";

// TODO: Move other helpers into the definition.
export function stateForBlockMove(
  def: KPuzzleDefinition,
  blockMove: BlockMove,
): Transformation {
  // TODO: Optimize this.
  const repMoveString = blockMoveToString(
    new BlockMove(
      blockMove.outerLayer,
      blockMove.innerLayer,
      blockMove.family,
      1,
    ),
  );
  let move: Transformation | undefined = def.moves[repMoveString];
  if (!move) {
    move = new KPuzzle(def).expandSlices(repMoveString, blockMove);
  }
  if (!move) {
    throw new Error(`Unknown move family: ${blockMove.family}`);
  }
  return Multiply(def, move, blockMove.amount);
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

  public applyMove(moveName: string): this {
    let move: Transformation | undefined = this.definition.moves[moveName];
    if (!move) {
      move = this.expandSlicesByName(moveName);
    }
    if (!move) {
      throw new Error(`Unknown move: ${moveName}`);
    }

    this.state = Combine(this.definition, this.state, move);
    return this;
  }

  public getMoveExpander(create: boolean): MoveExpander | undefined {
    let moveExpander = this.definition.moveExpander;
    if (create && !moveExpander) {
      moveExpander = new MoveExpander();
      this.definition.moveExpander = moveExpander;
    }
    return moveExpander;
  }
  public setFaceNames(faceNames: string[]): void {
    const me = this.getMoveExpander(true);
    if (me) {
      me.setFaceNames(faceNames);
    }
  }
  public addGrip(grip1: string, grip2: string, nslices: number): void {
    const me = this.getMoveExpander(true);
    return me ? me.addGrip(grip1, grip2, nslices, this.definition) : undefined;
  }
  public expandSlices(
    rep: string,
    blockMove: BlockMove,
  ): Transformation | undefined {
    const me = this.getMoveExpander(false);
    return me ? me.expandSlices(rep, blockMove, this.definition) : undefined;
  }
  public expandSlicesByName(mv: string): Transformation | undefined {
    const me = this.getMoveExpander(false);
    return me ? me.expandSlicesByName(mv, this.definition) : undefined;
  }
  public unswizzle(grip: string): string {
    const me = this.getMoveExpander(true);
    return me ? me.unswizzle(grip) : grip;
  }

  // TODO: Implement
  // parseState(): this {}

  // TODO: Alg parsing

  // TODO: Implement.
  // invert(): this {}
}
