import {BlockMove, Sequence, expand, parse, algToString} from "../alg/index"
import {Transformation, KPuzzleDefinition} from "./spec"

export function Combine(def: KPuzzleDefinition, t1: Transformation, t2: Transformation): Transformation {
  var newTrans: Transformation = <Transformation>{};
  for (var orbitName in def.orbits) {
    var oDef = def.orbits[orbitName];
    var o1 = t1[orbitName];
    var o2 = t2[orbitName];
    var newPerm = new Array(oDef.numPieces);
    var newOri = new Array(oDef.numPieces);
    for (var idx = 0; idx < oDef.numPieces; idx++) {
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
  var halfish = Multiply(def, t, Math.floor(amount / 2));
  var twiceHalfish = Combine(def, halfish, halfish);
  if (amount % 2 === 0) {
    return twiceHalfish;
  }
  else {
    return Combine(def, t, twiceHalfish);
  }
}
export function IdentityTransformation(definition: KPuzzleDefinition): Transformation {
  var transformation = <Transformation>{};
  for (var orbitName in definition.orbits) {
    var orbitDefinition = definition.orbits[orbitName];
    var newPermutation = new Array(orbitDefinition.numPieces);
    var newOrientation = new Array(orbitDefinition.numPieces);
    for (var i = 0; i < orbitDefinition.numPieces; i++) {
      newPermutation[i] = i;
      newOrientation[i] = 0;
    }
    var orbitTransformation = { permutation: newPermutation, orientation: newOrientation };
    transformation[orbitName] = orbitTransformation;
  }
  return transformation;
}

export function Invert(def: KPuzzleDefinition, t: Transformation): Transformation {
  var newTrans: Transformation = <Transformation>{};
  for (var orbitName in def.orbits) {
    var oDef = def.orbits[orbitName];
    var o = t[orbitName];
    var newPerm = new Array(oDef.numPieces);
    var newOri = new Array(oDef.numPieces);
    for (var idx = 0; idx < oDef.numPieces; idx++) {
      var fromIdx = (o.permutation[idx] as number);
      newPerm[fromIdx] = idx;
      newOri[fromIdx] = (oDef.orientations - o.orientation[idx] + oDef.orientations) % oDef.orientations;
    }
    newTrans[orbitName] = { permutation: newPerm, orientation: newOri };
  }
  return newTrans;
}

export function EquivalentTransformations(def: KPuzzleDefinition, t1: Transformation, t2: Transformation): boolean {
  for (var orbitName in def.orbits) {
    var oDef = def.orbits[orbitName];
    var o1 = t1[orbitName];
    var o2 = t2[orbitName];
    for (var idx = 0; idx < oDef.numPieces; idx++) {
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
export function stateForBlockMove(def: KPuzzleDefinition, blockMove: BlockMove) {
  // TODO: Optimize this.
  var repMoveString = algToString(new Sequence([new BlockMove(blockMove.outerLayer, blockMove.innerLayer, blockMove.family, 1)]));
  var move: Transformation | undefined = def.moves[repMoveString];
  if (!move) {
    move = new KPuzzle(def).expandSlices(repMoveString, blockMove);
  }
  if (!move) {
    throw `Unknown move family: ${blockMove.family}`;
  }
  return Multiply(def, move, blockMove.amount);
}

export class KPuzzle {
  public state: Transformation
  constructor(public definition: KPuzzleDefinition) {
    this.state = IdentityTransformation(definition);
  }

  serialize(): string {
    var output = ""
    for (var orbitName in this.definition.orbits) {
      output += orbitName + "\n";
      output += this.state[orbitName].permutation.join(" ") + "\n";
      output += this.state[orbitName].orientation.join(" ") + "\n";
    }
    output = output.slice(0, output.length - 1); // Trim last newline.
    return output;
  }

  applyBlockMove(blockMove: BlockMove) {
    this.state = Combine(this.definition, this.state, stateForBlockMove(this.definition, blockMove));
  }

  applyAlg(a: Sequence): void {
    // TODO: Iterator instead of full expansion.
    for (var move of <BlockMove[]>(expand(a).nestedUnits)) {
      this.applyBlockMove(move);
    }
  }

  applyMove(moveName: string): this {
    var move:Transformation|undefined = this.definition.moves[moveName];
    if (!move) {
      move = this.expandSlicesByName(moveName) ;
    }
    if (!move) {
      throw `Unknown move: ${moveName}`
    }

    this.state = Combine(this.definition, this.state, move);
    return this;
  }

  getMoveExpander(create:boolean) {
     var moveExpander = this.definition.moveExpander ;
     if (create && !moveExpander) {
        moveExpander = new MoveExpander() ;
        this.definition.moveExpander = moveExpander ;
     }
     return moveExpander ;
  }
  setFaceNames(faceNames:Array<string>):void {
     var me = this.getMoveExpander(true) ;
     if (me)
        me.setFaceNames(faceNames) ;
  }
  addGrip(grip1:string, grip2:string, nslices:number):void {
     var me = this.getMoveExpander(true) ;
     return me ? me.addGrip(grip1, grip2, nslices, this.definition) : undefined ;
  }
  expandSlices(rep:string, blockMove:BlockMove):Transformation|undefined {
     var me = this.getMoveExpander(false) ;
     return me ? me.expandSlices(rep, blockMove, this.definition) : undefined ;
  }
  expandSlicesByName(mv:string):Transformation|undefined {
     var me = this.getMoveExpander(false) ;
     return me ? me.expandSlicesByName(mv, this.definition) : undefined ;
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
  gripStash: {[key:string]: Transformation[]}
  moveStash: {[key:string]: Transformation}
  facenames?: Array<string>
  constructor() {
     this.gripStash = {} ;
     this.moveStash = {} ;
  }
  setFaceNames(fn:Array<string>):void {
     this.facenames = fn ;
  }
  addGrip(grip1:string, grip2:string, nslices:number, def:KPuzzleDefinition) {
     var slices = [] ;
     var axes = this.gripStash ;
     var moves = def.moves ;
     for (var i=1; i<=nslices; i++) {
        var t = (i==1 && moves[grip1]) || moves[""+i+grip1] ;
        if (!t) {
           t = (i==nslices && moves[grip2] || moves[""+(nslices+1-i)+grip2]) ;
           if (t)
              t = Invert(def, t) ;
        }
        if (!t)
           throw "Could not expand axis " + grip1 + " to " + grip2 +
                 " because we are missing a move for slice " + i ;
        slices.push(t) ;
     }
     axes[grip1] = slices ;
     var aprime = slices.map((_:Transformation)=>Invert(def, _)) ;
     aprime.reverse() ;
     axes[grip2] = aprime ;
  }
  splitByFaceNames(s:string, facenames:Array<string>) {
      var r:Array<string> = [] ;
      var at = 0 ;
      while (at < s.length) {
         var found = false ;
         for (var i=0; i<facenames.length; i++) {
            if (s.substr(at).startsWith(facenames[i])) {
               r.push(facenames[i]) ;
               at += facenames[i].length ;
               found = true ;
               break ;
            }
         }
         if (!found)
            return undefined ;
      }
      return r ;
  }
  expandSlices(rep:string, blockMove:BlockMove, def:KPuzzleDefinition) {
     var t = this.moveStash[rep] ;
     if (t)
        return t ;
     var axes = this.gripStash ;
     var family = blockMove.family ;
     var grip = family ;
     var isBlock = false ;
     // the following "reparse" code is almost certainly wrong
     if (/[a-z]/.test(family)) {
        isBlock = true ;
        grip = family.toUpperCase() ;
     }
     if (family.length > 1 && family.endsWith("w")) {
        isBlock = true ;
        grip = family.substring(0, family.length-1) ;
     }
     var slices = axes[grip] ;
     if (!slices && this.facenames) {   // can we unswizzle this grip name?
        var faceSplit = this.splitByFaceNames(grip, this.facenames) ;
        if (faceSplit) {
           for (var i=1; i<faceSplit.length; i++) {
              var testGrip = "" ;
              for (var j=0; j<faceSplit.length; j++)
                 testGrip += faceSplit[(i+j)%faceSplit.length] ;
              slices = axes[testGrip] ;
              if (slices) {
                 grip = testGrip ;
                 break ;
              }
           }
        }
     }
     if (!slices)
        return undefined ; // don't throw here; let others catch it
     var outer = blockMove.outerLayer ;
     var inner = blockMove.innerLayer ;
     if (inner == undefined) {
        if (outer == undefined) {
           outer = 1 ;
           inner = (isBlock ? 2 : 1) ;
        } else
           return undefined ; // should never happen
     } else if (outer == undefined)
        outer = (isBlock ? 1 : inner) ;
     if (inner < outer)
        return undefined ;
     if (outer > axes[grip].length)
        return undefined ;
     var t = slices[outer-1] ;
     for (var i=outer+1; i<=inner; i++)
        t = Combine(def, t, slices[i-1]) ;
     this.moveStash[rep] = t ;
     return t ;
  }
  expandSlicesByName(mv:string, def:KPuzzleDefinition) {
     var t = this.moveStash[mv] ;
     if (t)
        return t ;
     try {
        var alg = parse(mv) ;
        if (alg.nestedUnits.length != 1)
           return undefined ;
        var signmove = alg.nestedUnits[0] as BlockMove ; // need better way
        return this.expandSlices(mv, signmove, def) ;
     } catch (e) {
        return undefined ;
     }
  }
}
