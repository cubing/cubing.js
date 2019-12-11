import { BlockMove, blockMoveToString, expand, parse, Sequence } from "../alg";
import { KPuzzleDefinition, Transformation } from "./definition_types";

export function Combine(def: KPuzzleDefinition, t1: Transformation, t2: Transformation): Transformation {
  const newTrans: Transformation = {} as Transformation;
  for (const orbitName in def.orbits) {
    const oDef = def.orbits[orbitName];
    const o1 = t1[orbitName];
    const o2 = t2[orbitName];
    const newPerm = new Array(oDef.numPieces);
    const newOri = new Array(oDef.numPieces);
    for (let idx = 0; idx < oDef.numPieces; idx++) {
      newOri[idx] = (o1.orientation[o2.permutation[idx]] + o2.orientation[idx])
        % oDef.orientations;
      newPerm[idx] = o1.permutation[o2.permutation[idx]];
    }
    newTrans[orbitName] = { permutation: newPerm, orientation: newOri };
  }
  return newTrans;
}

export function Multiply(def: KPuzzleDefinition, t: Transformation, amount: number): Transformation {
  if (amount < 0) {
    return Multiply(def, Invert(def, t), -amount);
  }
  if (amount === 0) {
    return IdentityTransformation(def);
  }
  if (amount === 1) {
    return t;
  }
  const halfish = Multiply(def, t, Math.floor(amount / 2));
  const twiceHalfish = Combine(def, halfish, halfish);
  if (amount % 2 === 0) {
    return twiceHalfish;
  } else {
    return Combine(def, t, twiceHalfish);
  }
}
export function IdentityTransformation(definition: KPuzzleDefinition): Transformation {
  const transformation = {} as Transformation;
  for (const orbitName in definition.orbits) {
    const orbitDefinition = definition.orbits[orbitName];
    const newPermutation = new Array(orbitDefinition.numPieces);
    const newOrientation = new Array(orbitDefinition.numPieces);
    for (let i = 0; i < orbitDefinition.numPieces; i++) {
      newPermutation[i] = i;
      newOrientation[i] = 0;
    }
    const orbitTransformation = { permutation: newPermutation, orientation: newOrientation };
    transformation[orbitName] = orbitTransformation;
  }
  return transformation;
}

export function Invert(def: KPuzzleDefinition, t: Transformation): Transformation {
  const newTrans: Transformation = {} as Transformation;
  for (const orbitName in def.orbits) {
    const oDef = def.orbits[orbitName];
    const o = t[orbitName];
    const newPerm = new Array(oDef.numPieces);
    const newOri = new Array(oDef.numPieces);
    for (let idx = 0; idx < oDef.numPieces; idx++) {
      const fromIdx = (o.permutation[idx] as number);
      newPerm[fromIdx] = idx;
      newOri[fromIdx] = (oDef.orientations - o.orientation[idx] + oDef.orientations) % oDef.orientations;
    }
    newTrans[orbitName] = { permutation: newPerm, orientation: newOri };
  }
  return newTrans;
}

export function EquivalentTransformations(def: KPuzzleDefinition, t1: Transformation, t2: Transformation): boolean {
  for (const orbitName in def.orbits) {
    const oDef = def.orbits[orbitName];
    const o1 = t1[orbitName];
    const o2 = t2[orbitName];
    for (let idx = 0; idx < oDef.numPieces; idx++) {
      if (o1.orientation[idx] !== o2.orientation[idx]) {
        return false;
      }
      if (o1.permutation[idx] !== o2.permutation[idx]) {
        return false;
      }
    }
  }
  return true;
}

export function EquivalentStates(def: KPuzzleDefinition, t1: Transformation, t2: Transformation): boolean {
  // Turn transformations into states.
  // This accounts for indistinguishable pieces.
  return EquivalentTransformations(def, Combine(def, def.startPieces, t1), Combine(def, def.startPieces, t2));
}

// TODO: Move other helpers into the definition.
export function stateForBlockMove(def: KPuzzleDefinition, blockMove: BlockMove): Transformation {
  // TODO: Optimize this.
  const repMoveString = blockMoveToString(new BlockMove(blockMove.outerLayer, blockMove.innerLayer, blockMove.family, 1));
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
    this.state = Combine(this.definition, this.state, stateForBlockMove(this.definition, blockMove));
  }

  public applyAlg(a: Sequence): void {
    // TODO: Iterator instead of full expansion.
    for (const move of (expand(a).nestedUnits) as BlockMove[]) {
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
  public expandSlices(rep: string, blockMove: BlockMove): Transformation | undefined {
    const me = this.getMoveExpander(false);
    return me ? me.expandSlices(rep, blockMove, this.definition) : undefined;
  }
  public expandSlicesByName(mv: string): Transformation | undefined {
    const me = this.getMoveExpander(false);
    return me ? me.expandSlicesByName(mv, this.definition) : undefined;
  }
  public unswizzle(grip: string): string {
    const me = this.getMoveExpander(true);
    return me ? me.unswizzle(grip) : grip ;
  }

  // TODO: Implement
  // parseState(): this {}

  // TODO: Alg parsing

  // TODO: Implement.
  // invert(): this {}
}

//   This class supports expanding a set of slice moves (for instance,
//   U, 2U, 3U, 2D, D on the 5x5x5) into a full set of outer block, inner
//   slice, etc. moves such as 2-3u or 5U, automatically.  The addGrip()
//   method informs us what grips exist and how many slices there are.
//   The setFaceNames() method tells us what the names of the faces are
//   so we can unswizzle swizzled grip names.

export class MoveExpander {
  private gripStash: { [key: string]: Transformation[] };
  private moveStash: { [key: string]: Transformation };
  private facenames?: string[];
  private regrip: { [key: string]: string };
  constructor() {
    this.gripStash = {};
    this.moveStash = {};
    this.regrip = {};
  }
  public setFaceNames(fn: string[]): void {
    this.facenames = fn;
  }
  public addGrip(grip1: string, grip2: string, nslices: number, def: KPuzzleDefinition): void {
    const slices = [];
    const axes = this.gripStash;
    const moves = def.moves;
    for (let i = 1; i <= nslices; i++) {
      let t = (i === 1 && moves[grip1]) || moves["" + i + grip1];
      if (!t) {
        t = (i === nslices && moves[grip2] || moves["" + (nslices + 1 - i) + grip2]);
        if (t) {
          t = Invert(def, t);
        }
      }
      if (!t) {
        throw new Error("Could not expand axis " + grip1 + " to " + grip2 +
          " because we are missing a move for slice " + i);
      }
      slices.push(t);
    }
    axes[grip1] = slices;
    const aprime = slices.map((_: Transformation) => Invert(def, _));
    aprime.reverse();
    axes[grip2] = aprime;
  }
  public expandSlicesByName(mv: string, def: KPuzzleDefinition): Transformation | undefined {
    const t = this.moveStash[mv];
    if (t) {
      return t;
    }
    try {
      const alg = parse(mv);
      if (alg.nestedUnits.length !== 1) {
        return undefined;
      }
      const signmove = alg.nestedUnits[0] as BlockMove; // need better way
      return this.expandSlices(mv, signmove, def);
    } catch (e) {
      return undefined;
    }
  }
  public unswizzle(grip: string): string {
    if (this.regrip[grip]) {
      return this.regrip[grip] ;
    }
    if (!this.facenames) {
      return grip ;
    }
    const faceSplit = this.splitByFaceNames(grip, this.facenames);
    if (faceSplit) {
      for (let i = 1; i < faceSplit.length; i++) {
        let testGrip = "";
        for (let j = 0; j < faceSplit.length; j++) {
          testGrip += faceSplit[(i + j) % faceSplit.length];
        }
        if (this.gripStash[testGrip]) {
          this.regrip[grip] = testGrip;
          return testGrip ;
        }
      }
    }
    return grip ;
  }
  public expandSlices(rep: string, blockMove: BlockMove, def: KPuzzleDefinition): Transformation | undefined {
    const t = this.moveStash[rep];
    if (t) {
      return t;
    }
    const axes = this.gripStash;
    const family = blockMove.family;
    let grip = family;
    let isBlock = false;
    // the following "reparse" code is almost certainly wrong
    if (/[a-z]/.test(family)) {
      isBlock = true;
      grip = family.toUpperCase();
    }
    if (family.length > 1 && family.endsWith("w")) {
      isBlock = true;
      grip = family.substring(0, family.length - 1);
    }
    let slices = axes[grip];
    if (!slices && this.facenames) {
      grip = this.unswizzle(grip) ;
      slices = axes[grip] ;
    }
    if (!slices) {
      return undefined;
    } // don't throw here; let others catch it
    let outer = blockMove.outerLayer;
    let inner = blockMove.innerLayer;
    if (inner === undefined) {
      if (outer === undefined) {
        outer = 1;
        inner = (isBlock ? 2 : 1);
      } else {
        return undefined;
      } // should never happen
    } else if (outer === undefined) {
      outer = (isBlock ? 1 : inner);
    }
    if (inner < outer) {
      return undefined;
    }
    if (outer > axes[grip].length) {
      return undefined;
    }
    let t2 = slices[outer - 1];
    for (let i = outer + 1; i <= inner; i++) {
      t2 = Combine(def, t2, slices[i - 1]);
    }
    this.moveStash[rep] = t2;
    return t2;
  }
  private splitByFaceNames(s: string, facenames: string[]): string[] | undefined {
    const r: string[] = [];
    let at = 0;
    while (at < s.length) {
      let found = false;
      for (const facename of facenames) {
        if (s.substr(at).startsWith(facename)) {
          r.push(facename);
          at += facename.length;
          found = true;
          break;
        }
      }
      if (!found) {
        return undefined;
      }
    }
    return r;
  }
}
