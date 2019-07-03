import { Perm } from "./Perm" ;
export class OrbitDef {
   constructor(public size: number, public mod: number) {}
   public reassemblySize(): number {
      return Perm.factorial(this.size) * Math.pow(this.mod, this.size) ;
   }
}
export class OrbitsDef {
   constructor(public orbitnames: string[],
               public orbitdefs: OrbitDef[],
               public solved: VisibleState,
               public movenames: string[],
               public moveops: Transformation[]) {}
   public toKsolve(name: string, forTwisty: boolean): string[] {
      let result = [] ;
      result.push("Name " + name) ;
      result.push("") ;
      for (let i = 0; i < this.orbitnames.length; i++) {
         result.push("Set " + this.orbitnames[i] + " " +
                     this.orbitdefs[i].size + " " + this.orbitdefs[i].mod) ;
      }
      result.push("") ;
      result.push("Solved") ;
      for (let i = 0; i < this.orbitnames.length; i++) {
         result.push(this.orbitnames[i]) ;
         let o = this.solved.orbits[i].toKsolveVS() ;
         result.push(o[0]) ;
         result.push(o[1]) ;
      }
      result.push("End") ;
      result.push("") ;
      for (let i = 0; i < this.movenames.length; i++) {
         result.push("Move " + this.movenames[i]) ;
         for (let j = 0; j < this.orbitnames.length; j++) {
            if (!forTwisty && this.moveops[i].orbits[j].isIdentity()) {
               continue ;
            }
            result.push(this.orbitnames[j]) ;
            let o = this.moveops[i].orbits[j].toKsolve() ;
            result.push(o[0]) ;
            result.push(o[1]) ;
         }
         result.push("End") ;
         result.push("") ;
      }
      // extra blank line on end lets us use join("\n") to terminate all
      return result ;
   }
   public optimize(): OrbitsDef {
      let neworbitnames: string[] = [] ;
      let neworbitdefs: OrbitDef[] = [] ;
      let newsolved: Orbit[] = [] ;
      let newmoveops: Orbit[][] = [] ;
      for (let j = 0; j < this.moveops.length; j++) {
         newmoveops.push([]) ;
      }
      for (let i = 0; i < this.orbitdefs.length; i++) {
         let om = this.orbitdefs[i].mod ;
         let n = this.orbitdefs[i].size ;
         let du = new DisjointUnion(n) ;
         let changed = new Array<boolean>(this.orbitdefs[i].size) ;
         for (let k = 0; k < n; k++) {
            changed[k] = false ;
         }
         for (let j = 0; j < this.moveops.length; j++) {
            for (let k = 0; k < n; k++) {
               if (this.moveops[j].orbits[i].perm[k] != k ||
                   this.moveops[j].orbits[i].ori[k] != 0) {
                  changed[k] = true ;
                  du.union(k, this.moveops[j].orbits[i].perm[k]) ;
               }
            }
         }
         let keepori = true ;
         // right now we kill ori only if solved is unique and
         // if we can kill it completely.  This is not all the optimization
         // we can perform.
         if (om > 1) {
            keepori = false ;
            let duo = new DisjointUnion(this.orbitdefs[i].size * om) ;
            for (let j = 0; j < this.moveops.length; j++) {
               for (let k = 0; k < n; k++) {
                  if (this.moveops[j].orbits[i].perm[k] != k ||
                      this.moveops[j].orbits[i].ori[k] != 0) {
                     for (let o = 0; o < om; o++) {
                        duo.union(k * om + o, this.moveops[j].orbits[i].perm[k] * om +
                                      (o + this.moveops[j].orbits[i].ori[k]) % om) ;
                     }
                  }
               }
            }
            for (let j = 0; !keepori && j < n; j++) {
               for (let o = 1; o < om; o++) {
                  if (duo.find(j * om) == duo.find(j * om + o)) {
                     keepori = true ;
                  }
               }
            }
            for (let j = 0; !keepori && j < n; j++) {
               for (let k = 0; k < j; k++) {
                  if (this.solved.orbits[i].perm[j] ==
                      this.solved.orbits[i].perm[k]) {
                     keepori = true ;
                  }
               }
            }
         }
         // is there just one result set, or more than one?
         let nontriv = -1 ;
         let multiple = false ;
         for (let j = 0; j < this.orbitdefs[i].size; j++) {
            if (changed[j]) {
               let h = du.find(j) ;
               if (nontriv < 0) {
                  nontriv = h ;
               }
               else if (nontriv != h) {
                  multiple = true ;
 }
            }
         }
         for (let j = 0; j < this.orbitdefs[i].size; j++) {
            if (!changed[j]) {
               continue ;
            }
            let h = du.find(j) ;
            if (h != j) {
               continue ;
            }
            let no: number[] = [] ;
            let on: number[] = [] ;
            let nv = 0 ;
            for (let k = 0; k < this.orbitdefs[i].size; k++) {
               if (du.find(k) == j) {
                  no[nv] = k ;
                  on[k] = nv ;
                  nv++ ;
               }
            }
            if (multiple) {
               neworbitnames.push(this.orbitnames[i] + "_p" + j) ;
            }
            else {
               neworbitnames.push(this.orbitnames[i]) ;
            }
            if (keepori) {
               neworbitdefs.push(new OrbitDef(nv, this.orbitdefs[i].mod)) ;
               newsolved.push(this.solved.orbits[i].remapVS(no, nv)) ;
               for (let k = 0; k < this.moveops.length; k++) {
                  newmoveops[k].push(this.moveops[k].orbits[i].remap(no, on, nv)) ;
               }
            } else {
               neworbitdefs.push(new OrbitDef(nv, 1)) ;
               newsolved.push(this.solved.orbits[i].remapVS(no, nv).killOri()) ;
               for (let k = 0; k < this.moveops.length; k++) {
                  newmoveops[k].push(this.moveops[k].orbits[i].
                                                  remap(no, on, nv).killOri()) ;
               }
            }
         }
      }
      return new OrbitsDef(neworbitnames, neworbitdefs,
                           new VisibleState(newsolved), this.movenames,
                           newmoveops.map((_) => new Transformation(_))) ;
   }
   // generate a new "solved" position based on scrambling
   // we use an algorithm that should be faster for large puzzles than
   // just picking random moves.
   public scramble(n: number): void {
      let pool: Transformation[] = [] ;
      for (let i = 0; i < this.moveops.length; i++) {
         pool[i] = this.moveops[i] ;
      }
      for (let i = 0; i < pool.length; i++) {
         let j = Math.floor(Math.random() * pool.length) ;
         let t = pool[i] ;
         pool[i] = pool[j] ;
         pool[j] = t ;
      }
      if (n < pool.length) {
         n = pool.length ;
      }
      for (let i = 0; i < n; i++) {
         let ri = Math.floor(Math.random() * pool.length) ;
         let rj = Math.floor(Math.random() * pool.length) ;
         let rm = Math.floor(Math.random() * this.moveops.length) ;
         pool[ri] = pool[ri].mul(pool[rj]).mul(this.moveops[rm]) ;
         if (Math.random() < 0.1) { // break up parity
            pool[ri] = pool[ri].mul(this.moveops[rm]) ;
         }
      }
      let s = pool[0] ;
      for (let i = 1; i < pool.length; i++) {
         s = s.mul(pool[i]) ;
      }
      this.solved = this.solved.mul(s) ;
   }
   public reassemblySize(): number {
      let n = 1 ;
      for (let i = 0; i < this.orbitdefs.length; i++) {
         n *= this.orbitdefs[i].reassemblySize() ;
      }
      return n ;
   }
}
export class Orbit {
   public static e(n: number, mod: number): Orbit {
      return new Orbit(Perm.iota(n), Perm.zeros(n), mod) ;
   }
   constructor(public perm: number[], public ori: number[],
               public orimod: number) {}
   public mul(b: Orbit): Orbit {
      let n = this.perm.length ;
      let newPerm = new Array<number>(n) ;
      let newOri = new Array<number>(n) ;
      for (let i = 0; i < n; i++) {
         newPerm[i] = this.perm[b.perm[i]] ;
         newOri[i] = (this.ori[b.perm[i]] + b.ori[i]) % this.orimod ;
      }
      return new Orbit(newPerm, newOri, this.orimod) ;
   }
   public inv(): Orbit {
      let n = this.perm.length ;
      let newPerm = new Array<number>(n) ;
      let newOri = new Array<number>(n) ;
      for (let i = 0; i < n; i++) {
         newPerm[this.perm[i]] = i ;
         newOri[this.perm[i]] = (this.orimod - this.ori[i]) % this.orimod ;
      }
      return new Orbit(newPerm, newOri, this.orimod) ;
   }
   public equal(b: Orbit): boolean {
      let n = this.perm.length ;
      for (let i = 0; i < n; i++) {
         if (this.perm[i] != b.perm[i] || this.ori[i] != b.ori[i]) {
            return false ;
         }
      }
      return true ;
   }
   // in-place mutator
   public killOri(): this {
      let n = this.perm.length ;
      for (let i = 0; i < n; i++) {
         this.ori[i] = 0 ;
      }
      this.orimod = 1 ;
      return this ;
   }
   public toPerm(): Perm {
      let o = this.orimod ;
      if (o == 1) {
         return new Perm(this.perm) ;
      }
      let n = this.perm.length ;
      let newPerm = new Array<number>(n * o) ;
      for (let i = 0; i < n; i++) {
         for (let j = 0; j < o; j++) {
            newPerm[i * o + j] = o * this.perm[i] + (this.ori[i] + j) % o ;
         }
      }
      return new Perm(newPerm) ;
   }
   // returns tuple of sets of identical pieces in this orbit
   public identicalPieces(): number[][] {
      let done: boolean[] = [] ;
      let n = this.perm.length ;
      let r: number[][] = [] ;
      for (let i = 0; i < n; i++) {
         let v = this.perm[i] ;
         if (done[v] == undefined) {
            let s: number[] = [i] ;
            done[v] = true ;
            for (let j = i + 1; j < n; j++) {
               if (this.perm[j] == v) {
                  s.push(j) ;
               }
            }
            r.push(s) ;
         }
      }
      return r ;
   }
   public order(): number { // can be made more efficient
      return this.toPerm().order() ;
   }
   public isIdentity(): boolean {
      let n = this.perm.length ;
      for (let i = 0; i < n; i++) {
         if (this.perm[i] != i || this.ori[i] != 0) {
            return false ;
         }
      }
      return true ;
   }
   public remap(no: number[], on: number[], nv: number): Orbit {
      let newPerm = new Array<number>(nv) ;
      let newOri = new Array<number>(nv) ;
      for (let i = 0; i < nv; i++) {
         newPerm[i] = on[this.perm[no[i]]] ;
         newOri[i] = this.ori[no[i]] ;
      }
      return new Orbit(newPerm, newOri, this.orimod) ;
   }
   public remapVS(no: number[], nv: number): Orbit {
      let newPerm = new Array<number>(nv) ;
      let newOri = new Array<number>(nv) ;
      let nextNew = 0 ;
      let reassign = [] ;
      for (let i = 0; i < nv; i++) {
         let ov = this.perm[no[i]] ;
         if (reassign[ov] == undefined) {
            reassign[ov] = nextNew++ ;
         }
         newPerm[i] = reassign[ov] ;
         newOri[i] = this.ori[no[i]] ;
      }
      return new Orbit(newPerm, newOri, this.orimod) ;
   }
   public toKsolveVS(): string[] {
      return [this.perm.map((_: number) => _ + 1).join(" "), this.ori.join(" ")] ;
   }
   public toKsolve(): string[] {
      let newori = new Array<number>(this.ori.length) ;
      for (let i = 0; i < newori.length; i++) {
         newori[this.perm[i]] = this.ori[i] ;
      }
      return [this.perm.map((_: number) => _ + 1).join(" "), newori.join(" ")] ;
   }
}
export class TransformationBase {
   constructor(public orbits: Orbit[]) {}
   public internalMul(b: TransformationBase): Orbit[] {
      let newOrbits: Orbit[] = [] ;
      for (let i = 0; i < this.orbits.length; i++) {
         newOrbits.push(this.orbits[i].mul(b.orbits[i])) ;
      }
      return newOrbits ;
   }
   public internalInv(): Orbit[] {
      let newOrbits: Orbit[] = [] ;
      for (let i = 0; i < this.orbits.length; i++) {
         newOrbits.push(this.orbits[i].inv()) ;
      }
      return newOrbits ;
   }
   public equal(b: TransformationBase): boolean {
      for (let i = 0; i < this.orbits.length; i++) {
         if (!this.orbits[i].equal(b.orbits[i])) {
            return false ;
         }
      }
      return true ;
   }
   public killOri(): this {
      for (let i = 0; i < this.orbits.length; i++) {
         this.orbits[i].killOri() ;
      }
      return this ;
   }
   public toPerm(): Perm {
      let perms = new Array<Perm>() ;
      let n = 0 ;
      for (let i = 0; i < this.orbits.length; i++) {
         let p = this.orbits[i].toPerm() ;
         perms.push(p) ;
         n += p.n ;
      }
      let newPerm = new Array<number>(n) ;
      n = 0 ;
      for (let i = 0; i < this.orbits.length; i++) {
         let p = perms[i] ;
         for (let j = 0; j < p.n; j++) {
            newPerm[n + j] = n + p.p[j] ;
         }
         n += p.n ;
      }
      return new Perm(newPerm) ;
   }
   public identicalPieces(): number[][] {
      let r: number[][] = [] ;
      let n = 0 ;
      for (let i = 0; i < this.orbits.length; i++) {
         let o = this.orbits[i].orimod ;
         let s = this.orbits[i].identicalPieces() ;
         for (let j = 0; j < s.length; j++) {
            r.push(s[j].map((_) => _ * o + n)) ;
         }
         n += o * this.orbits[i].perm.length ;
      }
      return r ;
   }
   public order(): number {
      let r = 1 ;
      for (let i = 0; i < this.orbits.length; i++) {
         r = Perm.lcm(r, this.orbits[i].order()) ;
      }
      return r ;
   }
}
export class Transformation extends TransformationBase {
   constructor(orbits: Orbit[]) {
      super(orbits) ;
   }
   public mul(b: Transformation): Transformation {
      return new Transformation(this.internalMul(b)) ;
   }
   public mulScalar(n: number): Transformation {
      if (n == 0) {
         return this.e() ;
      }
      let t: Transformation = this ;
      if (n < 0) {
         t = t.inv() ;
         n = - n ;
      }
      while ((n & 1) == 0) {
         t = t.mul(t) ;
         n >>= 1 ;
      }
      if (n == 1) {
         return t ;
      }
      let s = t ;
      let r = this.e() ;
      while (n > 0) {
         if (n & 1) {
            r = r.mul(s) ;
         }
         if (n > 1) {
            s = s.mul(s) ;
         }
         n >>= 1 ;
      }
      return r ;
   }
   public inv(): Transformation {
      return new Transformation(this.internalInv()) ;
   }
   public e(): Transformation {
      return new Transformation(this.orbits.map(
         (_: Orbit) => Orbit.e(_.perm.length, _.orimod))) ;
   }
}
export class VisibleState extends TransformationBase {
   constructor(orbits: Orbit[]) {
      super(orbits) ;
   }
   public mul(b: Transformation): VisibleState {
      return new VisibleState(this.internalMul(b)) ;
   }
}
//  Disjoint set union implementation.
class DisjointUnion {
   public heads: number[] ;
   constructor(public n: number) {
      this.heads = new Array<number>(n) ;
      for (let i = 0; i < n; i++) {
         this.heads[i] = i ;
      }
   }
   public find(v: number): number {
      let h = this.heads[v] ;
      if (this.heads[h] == h) {
         return h ;
      }
      h = this.find(this.heads[h]) ;
      this.heads[v] = h ;
      return h ;
   }
   public union(a: number, b: number): void {
      let ah = this.find(a) ;
      let bh = this.find(b) ;
      if (ah < bh) {
         this.heads[bh] = ah ;
      } else if (ah > bh) {
         this.heads[ah] = bh ;
      }
   }
}
export function showcanon(g: OrbitsDef, disp: (s: string) => void): void {
   // show information for canonical move derivation
   let n = g.moveops.length ;
   if (n > 30) {
      throw new Error("Canon info too big for bitmask") ;
   }
   let orders = [] ;
   let commutes = [] ;
   for (let i = 0; i < n; i++) {
      let permA = g.moveops[i] ;
      orders.push(permA.order()) ;
      let bits = 0 ;
      for (let j = 0; j < n; j++) {
         if (j == i) {
            continue ;
         }
         let permB = g.moveops[j] ;
         if (permA.mul(permB).equal(permB.mul(permA))) {
            bits |= 1 << j ;
         }
      }
      commutes.push(bits) ;
   }
   let curlev: any = {} ;
   curlev[0] = 1 ;
   for (let d = 0; d < 100; d++) {
      let sum = 0 ;
      let nextlev: any = {} ;
      let uniq = 0 ;
      for (let sti in curlev) {
         let st = +sti ; // string to number
         let cnt = curlev[st] ;
         sum += cnt ;
         uniq++ ;
         for (let mv = 0; mv < orders.length; mv++) {
            if (((st >> mv) & 1) == 0 &&
                (st & commutes[mv] & ((1 << mv) - 1)) == 0) {
               let nst = (st & commutes[mv]) | (1 << mv) ;
               if (nextlev[nst] == undefined) {
                  nextlev[nst] = 0 ;
               }
               nextlev[nst] += (orders[mv] - 1) * cnt ;
            }
         }
      }
      disp("" + d + ": canonseq " + sum + " states " + uniq) ;
      curlev = nextlev ;
   }
}
// This is a less effective canonicalization (that happens to work fine
// for the 3x3x3).  We include this only for comparison.
export function showcanon0(g: OrbitsDef, disp: (s: string) => void): void {
   // show information for canonical move derivation
   let n = g.moveops.length ;
   if (n > 30) {
      throw new Error("Canon info too big for bitmask") ;
   }
   let orders = [] ;
   let commutes = [] ;
   for (let i = 0; i < n; i++) {
      let permA = g.moveops[i] ;
      orders.push(permA.order()) ;
      let bits = 0 ;
      for (let j = 0; j < n; j++) {
         if (j == i) {
            continue ;
         }
         let permB = g.moveops[j] ;
         if (permA.mul(permB).equal(permB.mul(permA))) {
            bits |= 1 << j ;
         }
      }
      commutes.push(bits) ;
   }
   let curlev: any = {} ;
   disp("" + 0 + ": canonseq " + 1) ;
   for (let x = 0; x < orders.length; x++) {
      curlev[x] = orders[x] - 1 ;
   }
   for (let d = 1; d < 100; d++) {
      let sum = 0 ;
      let nextlev: any = {} ;
      let uniq = 0 ;
      for (let sti in curlev) {
         let st = +sti ; // string to number
         let cnt = curlev[st] ;
         sum += cnt ;
         uniq++ ;
         for (let mv = 0; mv < orders.length; mv++) {
            if (mv == st || ((commutes[mv] & (1 << st)) && mv < st)) {
               continue ;
            }
            if (nextlev[mv] == undefined) {
               nextlev[mv] = 0 ;
            }
            nextlev[mv] += (orders[mv] - 1) * cnt ;
         }
      }
      disp("" + d + ": canonseq " + sum + " states " + uniq) ;
      curlev = nextlev ;
   }
}
