import {BlockMove, parse} from "../alg/index";
import { Combine, Invert } from "./operations";
import {KPuzzleDefinition, Transformation} from "./spec";
//   This class supports expanding a set of slice moves (for instance,
//   U, 2U, 3U, 2D, D on the 5x5x5) into a full set of outer block, inner
//   slice, etc. moves such as 2-3u or 5U, automatically.  The addGrip()
//   method informs us what grips exist and how many slices there are.
//   The setFaceNames() method tells us what the names of the faces are
//   so we can unswizzle swizzled grip names.

export class MoveExpander {
  public gripStash: {[key: string]: Transformation[]};
  public moveStash: {[key: string]: Transformation};
  public facenames?: string[];
  constructor() {
     this.gripStash = {} ;
     this.moveStash = {} ;
  }
  public setFaceNames(fn: string[]): void {
     this.facenames = fn ;
  }
  public addGrip(grip1: string, grip2: string, nslices: number, def: KPuzzleDefinition) {
     let slices = [] ;
     let axes = this.gripStash ;
     let moves = def.moves ;
     for (let i = 1; i <= nslices; i++) {
        let t = (i == 1 && moves[grip1]) || moves["" + i + grip1] ;
        if (!t) {
           t = (i == nslices && moves[grip2] || moves["" + (nslices + 1 - i) + grip2]) ;
           if (t) {
              t = Invert(def, t) ;
           }
        }
        if (!t) {
           throw new Error("Could not expand axis " + grip1 + " to " + grip2 +
                 " because we are missing a move for slice " + i) ;
        }
        slices.push(t) ;
     }
     axes[grip1] = slices ;
     let aprime = slices.map((_: Transformation) => Invert(def, _)) ;
     aprime.reverse() ;
     axes[grip2] = aprime ;
  }
  public splitByFaceNames(s: string, facenames: string[]) {
      let r: string[] = [] ;
      let at = 0 ;
      while (at < s.length) {
         let found = false ;
         for (let i = 0; i < facenames.length; i++) {
            if (s.substr(at).startsWith(facenames[i])) {
               r.push(facenames[i]) ;
               at += facenames[i].length ;
               found = true ;
               break ;
            }
         }
         if (!found) {
            return undefined ;
         }
      }
      return r ;
  }
  public expandSlices(rep: string, blockMove: BlockMove, def: KPuzzleDefinition) {
     let t = this.moveStash[rep] ;
     if (t) {
        return t ;
     }
     let axes = this.gripStash ;
     let family = blockMove.family ;
     let grip = family ;
     let isBlock = false ;
     // the following "reparse" code is almost certainly wrong
     if (/[a-z]/.test(family)) {
        isBlock = true ;
        grip = family.toUpperCase() ;
     }
     if (family.length > 1 && family.endsWith("w")) {
        isBlock = true ;
        grip = family.substring(0, family.length - 1) ;
     }
     let slices = axes[grip] ;
     if (!slices && this.facenames) {   // can we unswizzle this grip name?
        let faceSplit = this.splitByFaceNames(grip, this.facenames) ;
        if (faceSplit) {
           for (let i = 1; i < faceSplit.length; i++) {
              let testGrip = "" ;
              for (let j = 0; j < faceSplit.length; j++) {
                 testGrip += faceSplit[(i + j) % faceSplit.length] ;
              }
              slices = axes[testGrip] ;
              if (slices) {
                 grip = testGrip ;
                 break ;
              }
           }
        }
     }
     if (!slices) {
        return undefined ;
     } // don't throw here; let others catch it
     let outer = blockMove.outerLayer ;
     let inner = blockMove.innerLayer ;
     if (inner == undefined) {
        if (outer == undefined) {
           outer = 1 ;
           inner = (isBlock ? 2 : 1) ;
        } else {
           return undefined ;
        } // should never happen
     } else if (outer == undefined) {
        outer = (isBlock ? 1 : inner) ;
 }
     if (inner < outer) {
        return undefined ;
     }
     if (outer > axes[grip].length) {
        return undefined ;
     }
     let t = slices[outer - 1] ;
     for (let i = outer + 1; i <= inner; i++) {
        t = Combine(def, t, slices[i - 1]) ;
     }
     this.moveStash[rep] = t ;
     return t ;
  }
  public expandSlicesByName(mv: string, def: KPuzzleDefinition) {
     let t = this.moveStash[mv] ;
     if (t) {
        return t ;
     }
     try {
        let alg = parse(mv) ;
        if (alg.nestedUnits.length != 1) {
           return undefined ;
        }
        let signmove = alg.nestedUnits[0] as BlockMove ; // need better way
        return this.expandSlices(mv, signmove, def) ;
     } catch (e) {
        return undefined ;
     }
  }
}
