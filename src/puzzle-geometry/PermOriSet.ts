import { Perm } from "./Perm" ;
export class OrbitDef {
   constructor(public size:number, public mod:number) {}
   reassemblySize():number {
      return Perm.factorial(this.size)*Math.pow(this.mod, this.size) ;
   }
}
export class OrbitsDef {
   constructor(public orbitnames:Array<string>,
               public orbitdefs:Array<OrbitDef>,
               public solved:VisibleState,
               public movenames:Array<string>,
               public moveops:Array<Transformation>) {}
   toKsolve(name:string, forTwisty:boolean):Array<string> {
      var result = [] ;
      result.push("Name " + name) ;
      result.push("") ;
      for (var i=0; i<this.orbitnames.length; i++)
         result.push("Set " + this.orbitnames[i] + " " +
                     this.orbitdefs[i].size + " " + this.orbitdefs[i].mod) ;
      result.push("") ;
      result.push("Solved") ;
      for (var i=0; i<this.orbitnames.length; i++) {
         result.push(this.orbitnames[i]) ;
         var o = this.solved.orbits[i].toKsolveVS() ;
         result.push(o[0]) ;
         result.push(o[1]) ;
      }
      result.push("End") ;
      result.push("") ;
      for (var i=0; i<this.movenames.length; i++) {
         result.push("Move " + this.movenames[i]) ;
         for (var j=0; j<this.orbitnames.length; j++) {
            if (!forTwisty && this.moveops[i].orbits[j].isIdentity())
               continue ;
            result.push(this.orbitnames[j]) ;
            var o = this.moveops[i].orbits[j].toKsolve() ;
            result.push(o[0]) ;
            result.push(o[1]) ;
         }
         result.push("End") ;
         result.push("") ;
      }
      // extra blank line on end lets us use join("\n") to terminate all
      return result ;
   }
   optimize():OrbitsDef {
      var neworbitnames:Array<string> = [] ;
      var neworbitdefs:Array<OrbitDef> = [] ;
      var newsolved:Array<Orbit> = [] ;
      var newmoveops:Array<Array<Orbit>> = [] ;
      for (var j=0; j<this.moveops.length; j++)
         newmoveops.push([]) ;
      for (var i=0; i<this.orbitdefs.length; i++) {
         var om = this.orbitdefs[i].mod ;
         var n = this.orbitdefs[i].size ;
         var du = new DisjointUnion(n) ;
         var changed = new Array<boolean>(this.orbitdefs[i].size) ;
         for (var k=0; k<n; k++)
            changed[k] = false ;
         for (var j=0; j<this.moveops.length; j++)
            for (var k=0; k<n; k++)
               if (this.moveops[j].orbits[i].perm[k] != k ||
                   this.moveops[j].orbits[i].ori[k] != 0) {
                  changed[k] = true ;
                  du.union(k, this.moveops[j].orbits[i].perm[k]) ;
               }
         var keepori = true ;
         // right now we kill ori only if solved is unique and
         // if we can kill it completely.  This is not all the optimization
         // we can perform.
         if (om > 1) {
            keepori = false ;
            var duo = new DisjointUnion(this.orbitdefs[i].size * om) ;
            for (var j=0; j<this.moveops.length; j++)
               for (var k=0; k<n; k++)
                  if (this.moveops[j].orbits[i].perm[k] != k ||
                      this.moveops[j].orbits[i].ori[k] != 0)
                     for (var o=0; o<om; o++)
                        duo.union(k*om+o, this.moveops[j].orbits[i].perm[k]*om+
                                      (o+this.moveops[j].orbits[i].ori[k])%om) ;
            for (var j=0; !keepori && j<n; j++)
               for (var o=1; o<om; o++)
                  if (duo.find(j*om) == duo.find(j*om+o))
                     keepori = true ;
            for (var j=0; !keepori && j<n; j++)
               for (var k=0; k<j; k++)
                  if (this.solved.orbits[i].perm[j] ==
                      this.solved.orbits[i].perm[k])
                     keepori = true ;
         }
         // is there just one result set, or more than one?
         var nontriv = -1 ;
         var multiple = false ;
         for (var j=0; j<this.orbitdefs[i].size; j++)
            if (changed[j]) {
               var h = du.find(j) ;
               if (nontriv < 0)
                  nontriv = h ;
               else if (nontriv != h)
                  multiple = true ;
            }
         for (var j=0; j<this.orbitdefs[i].size; j++) {
            if (!changed[j])
               continue ;
            var h = du.find(j) ;
            if (h != j)
               continue ;
            var no:Array<number> = [] ;
            var on:Array<number> = [] ;
            var nv = 0 ;
            for (var k=0; k<this.orbitdefs[i].size; k++)
               if (du.find(k) == j) {
                  no[nv] = k ;
                  on[k] = nv ;
                  nv++ ;
               }
            if (multiple)
               neworbitnames.push(this.orbitnames[i] + "_p" + j) ;
            else
               neworbitnames.push(this.orbitnames[i]) ;
            if (keepori) {
               neworbitdefs.push(new OrbitDef(nv, this.orbitdefs[i].mod)) ;
               newsolved.push(this.solved.orbits[i].remapVS(no, nv)) ;
               for (var k=0; k<this.moveops.length; k++)
                  newmoveops[k].push(this.moveops[k].orbits[i].remap(no, on, nv)) ;
            } else {
               neworbitdefs.push(new OrbitDef(nv, 1)) ;
               newsolved.push(this.solved.orbits[i].remapVS(no, nv).killOri()) ;
               for (var k=0; k<this.moveops.length; k++)
                  newmoveops[k].push(this.moveops[k].orbits[i].
                                                  remap(no, on, nv).killOri()) ;
            }
         }
      }
      return new OrbitsDef(neworbitnames, neworbitdefs,
                           new VisibleState(newsolved), this.movenames,
                           newmoveops.map((_)=>new Transformation(_))) ;
   }
   // generate a new "solved" position based on scrambling
   // we use an algorithm that should be faster for large puzzles than
   // just picking random moves.
   scramble(n:number):void {
      var pool:Array<Transformation> = [] ;
      for (var i=0; i<this.moveops.length; i++)
         pool[i] = this.moveops[i] ;
      for (var i=0; i<pool.length; i++) {
         var j = Math.floor(Math.random() * pool.length) ;
         var t = pool[i] ;
         pool[i] = pool[j] ;
         pool[j] = t ;
      }
      if (n < pool.length)
         n = pool.length ;
      for (var i=0; i<n; i++) {
         var ri = Math.floor(Math.random() * pool.length) ;
         var rj = Math.floor(Math.random() * pool.length) ;
         var rm = Math.floor(Math.random() * this.moveops.length) ;
         pool[ri] = pool[ri].mul(pool[rj]).mul(this.moveops[rm]) ;
         if (Math.random() < 0.1) // break up parity
            pool[ri] = pool[ri].mul(this.moveops[rm]) ;
      }
      var s = pool[0] ;
      for (var i=1; i<pool.length; i++)
         s = s.mul(pool[i]) ;
      this.solved = this.solved.mul(s) ;
   }
   reassemblySize():number {
      var n = 1 ;
      for (var i=0; i<this.orbitdefs.length; i++)
         n *= this.orbitdefs[i].reassemblySize() ;
      return n ;
   }
}
export class Orbit {
   constructor(public perm:Array<number>, public ori:Array<number>,
               public orimod:number) {}
   mul(b:Orbit):Orbit {
      var n = this.perm.length ;
      var newPerm = new Array<number>(n) ;
      var newOri = new Array<number>(n) ;
      for (var i=0; i<n; i++) {
         newPerm[i] = this.perm[b.perm[i]] ;
         newOri[i] = (this.ori[b.perm[i]]+b.ori[i])%this.orimod ;
      }
      return new Orbit(newPerm, newOri, this.orimod) ;
   }
   inv():Orbit {
      var n = this.perm.length ;
      var newPerm = new Array<number>(n) ;
      var newOri = new Array<number>(n) ;
      for (var i=0; i<n; i++) {
         newPerm[this.perm[i]] = i ;
         newOri[this.perm[i]] = (this.orimod-this.ori[i])%this.orimod ;
      }
      return new Orbit(newPerm, newOri, this.orimod) ;
   }
   equal(b:Orbit):boolean {
      var n = this.perm.length ;
      for (var i=0; i<n; i++)
         if (this.perm[i] != b.perm[i] || this.ori[i] != b.ori[i])
            return false ;
      return true ;
   }
   // in-place mutator
   killOri():this {
      var n = this.perm.length ;
      for (var i=0; i<n; i++)
         this.ori[i] = 0 ;
      this.orimod = 1 ;
      return this ;
   }
   toPerm():Perm {
      var o = this.orimod ;
      if (o == 1)
         return new Perm(this.perm) ;
      var n = this.perm.length ;
      var newPerm = new Array<number>(n*o) ;
      for (var i=0; i<n; i++)
         for (var j=0; j<o; j++)
            newPerm[i*o+j] = o*this.perm[i]+(this.ori[i]+j)%o ;
      return new Perm(newPerm) ;
   }
   // returns tuple of sets of identical pieces in this orbit
   identicalPieces():Array<Array<number>> {
      var done:Array<boolean> = [] ;
      var n = this.perm.length ;
      var r:Array<Array<number>> = [] ;
      for (var i=0; i<n; i++) {
         var v = this.perm[i] ;
         if (done[v] == undefined) {
            var s:Array<number> = [i] ;
            done[v] = true ;
            for (var j=i+1; j<n; j++)
               if (this.perm[j] == v)
                  s.push(j) ;
            r.push(s) ;
         }
      }
      return r ;
   }
   order():number { // can be made more efficient
      return this.toPerm().order() ;
   }
   static e(n:number, mod:number):Orbit {
      return new Orbit(Perm.iota(n), Perm.zeros(n), mod) ;
   }
   isIdentity():boolean {
      var n = this.perm.length ;
      for (var i=0; i<n; i++)
         if (this.perm[i] != i || this.ori[i] != 0)
            return false ;
      return true ;
   }
   remap(no:Array<number>, on:Array<number>, nv:number):Orbit {
      var newPerm = new Array<number>(nv) ;
      var newOri = new Array<number>(nv) ;
      for (var i=0; i<nv; i++) {
         newPerm[i] = on[this.perm[no[i]]] ;
         newOri[i] = this.ori[no[i]] ;
      }
      return new Orbit(newPerm, newOri, this.orimod) ;
   }
   remapVS(no:Array<number>, nv:number):Orbit {
      var newPerm = new Array<number>(nv) ;
      var newOri = new Array<number>(nv) ;
      var nextNew = 0 ;
      var reassign = [] ;
      for (var i=0; i<nv; i++) {
         var ov = this.perm[no[i]] ;
         if (reassign[ov] == undefined)
            reassign[ov] = nextNew++ ;
         newPerm[i] = reassign[ov] ;
         newOri[i] = this.ori[no[i]] ;
      }
      return new Orbit(newPerm, newOri, this.orimod) ;
   }
   toKsolveVS():Array<string> {
      return [this.perm.map((_:number)=>_+1).join(" "), this.ori.join(" ")] ;
   }
   toKsolve():Array<string> {
      var newori = new Array<number>(this.ori.length) ;
      for (var i=0; i<newori.length; i++)
         newori[this.perm[i]] = this.ori[i] ;
      return [this.perm.map((_:number)=>_+1).join(" "), newori.join(" ")] ;
   }
}
export class TransformationBase {
   constructor(public orbits:Array<Orbit>) {}
   internalMul(b:TransformationBase):Array<Orbit> {
      var newOrbits:Array<Orbit> = [] ;
      for (var i=0; i<this.orbits.length; i++)
         newOrbits.push(this.orbits[i].mul(b.orbits[i])) ;
      return newOrbits ;
   }
   internalInv():Array<Orbit> {
      var newOrbits:Array<Orbit> = [] ;
      for (var i=0; i<this.orbits.length; i++)
         newOrbits.push(this.orbits[i].inv()) ;
      return newOrbits ;
   }
   equal(b:TransformationBase):boolean {
      for (var i=0; i<this.orbits.length; i++)
         if (!this.orbits[i].equal(b.orbits[i]))
            return false ;
      return true ;
   }
   killOri():this {
      for (var i=0; i<this.orbits.length; i++)
         this.orbits[i].killOri() ;
      return this ;
   }
   toPerm():Perm {
      var perms = new Array<Perm>() ;
      var n = 0 ;
      for (var i=0; i<this.orbits.length; i++) {
         var p = this.orbits[i].toPerm() ;
         perms.push(p) ;
         n += p.n ;
      }
      var newPerm = new Array<number>(n) ;
      n = 0 ;
      for (var i=0; i<this.orbits.length; i++) {
         var p = perms[i] ;
         for (var j=0; j<p.n; j++)
            newPerm[n+j] = n + p.p[j] ;
         n += p.n ;
      }
      return new Perm(newPerm) ;
   }
   identicalPieces():Array<Array<number>> {
      var r:Array<Array<number>> = [] ;
      var n = 0 ;
      for (var i=0; i<this.orbits.length; i++) {
         var o = this.orbits[i].orimod ;
         var s = this.orbits[i].identicalPieces() ;
         for (var j=0; j<s.length; j++)
            r.push(s[j].map((_)=>_*o+n)) ;
         n += o * this.orbits[i].perm.length ;
      }
      return r ;
   }
   order():number {
      var r = 1 ;
      for (var i=0; i<this.orbits.length; i++)
         r = Perm.lcm(r, this.orbits[i].order()) ;
      return r ;
   }
}
export class Transformation extends TransformationBase {
   constructor(orbits:Array<Orbit>) {
      super(orbits) ;
   }
   mul(b:Transformation):Transformation {
      return new Transformation(this.internalMul(b)) ;
   }
   mulScalar(n:number):Transformation {
      if (n == 0)
         return this.e() ;
      var t:Transformation = this ;
      if (n < 0) {
         t = t.inv() ;
         n = - n ;
      }
      while ((n & 1) == 0) {
         t = t.mul(t) ;
         n >>= 1 ;
      }
      if (n == 1)
         return t ;
      var s = t ;
      var r = this.e() ;
      while (n > 0) {
         if (n & 1)
            r = r.mul(s) ;
         if (n > 1)
            s = s.mul(s) ;
         n >>= 1 ;
      }
      return r ;
   }
   inv():Transformation {
      return new Transformation(this.internalInv()) ;
   }
   e():Transformation {
      return new Transformation(this.orbits.map(
         (_:Orbit)=>Orbit.e(_.perm.length,_.orimod))) ;
   }
}
export class VisibleState extends TransformationBase {
   constructor(orbits:Array<Orbit>) {
      super(orbits) ;
   }
   mul(b:Transformation):VisibleState {
      return new VisibleState(this.internalMul(b)) ;
   }
}
//  Disjoint set union implementation.
class DisjointUnion {
   heads:Array<number> ;
   constructor(public n:number) {
      this.heads = new Array<number>(n) ;
      for (var i=0; i<n; i++)
         this.heads[i] = i ;
   }
   find(v:number):number {
      var h = this.heads[v] ;
      if (this.heads[h] == h)
         return h ;
      h = this.find(this.heads[h]) ;
      this.heads[v] = h ;
      return h ;
   }
   union(a:number, b:number):void {
      var ah = this.find(a) ;
      var bh = this.find(b) ;
      if (ah < bh) {
         this.heads[bh] = ah ;
      } else if (ah > bh) {
         this.heads[ah] = bh ;
      }
   }
}
export function showcanon(g:OrbitsDef,disp:(s:string)=>void):void {
   // show information for canonical move derivation
   var n = g.moveops.length ;
   if (n > 30)
      throw "Canon info too big for bitmask" ;
   var orders = [] ; 
   var commutes = [] ;
   for (var i=0; i<n; i++) {
      var permA = g.moveops[i] ;
      orders.push(permA.order()) ;
      var bits = 0 ;
      for (var j=0; j<n; j++) {
         if (j == i) 
            continue ;
         var permB = g.moveops[j] ;
         if (permA.mul(permB).equal(permB.mul(permA))) {
            bits |= 1<<j ;
         }
      }
      commutes.push(bits) ;
   }
   var curlev:any = {} ;
   curlev[0] = 1 ;
   for (var d=0; d<100; d++) {
      var sum = 0 ;
      var nextlev:any = {} ;
      var uniq = 0 ;
      for (var sti in curlev) {
         var st = +sti ; // string to number
         var cnt = curlev[st] ;
         sum += cnt ;
         uniq++ ; 
         for (var mv=0; mv<orders.length; mv++) {
            if (((st >> mv) & 1) == 0 && 
                (st & commutes[mv] & ((1 << mv) - 1)) == 0) {
               var nst = (st & commutes[mv]) | (1 << mv) ;
               if (nextlev[nst] == undefined)
                  nextlev[nst] = 0 ;
               nextlev[nst] += (orders[mv]-1) * cnt ;
            }
         }
      }
      disp("" + d + ": canonseq " + sum + " states " + uniq) ;
      curlev = nextlev ;
   }
}
// This is a less effective canonicalization (that happens to work fine
// for the 3x3x3).  We include this only for comparison.
export function showcanon0(g:OrbitsDef,disp:(s:string)=>void):void {
   // show information for canonical move derivation
   var n = g.moveops.length ;
   if (n > 30)
      throw "Canon info too big for bitmask" ;
   var orders = [] ; 
   var commutes = [] ;
   for (var i=0; i<n; i++) {
      var permA = g.moveops[i] ;
      orders.push(permA.order()) ;
      var bits = 0 ;
      for (var j=0; j<n; j++) {
         if (j == i) 
            continue ;
         var permB = g.moveops[j] ;
         if (permA.mul(permB).equal(permB.mul(permA))) {
            bits |= 1<<j ;
         }
      }
      commutes.push(bits) ;
   }
   var curlev:any = {} ;
   disp("" + 0 + ": canonseq " + 1) ;
   for (var x=0; x<orders.length; x++) {
      curlev[x] = orders[x]-1 ;
   }
   for (var d=1; d<100; d++) {
      var sum = 0 ;
      var nextlev:any = {} ;
      var uniq = 0 ;
      for (var sti in curlev) {
         var st = +sti ; // string to number
         var cnt = curlev[st] ;
         sum += cnt ;
         uniq++ ; 
         for (var mv=0; mv<orders.length; mv++) {
            if (mv == st || ((commutes[mv] & (1 << st)) && mv < st))
               continue ;
            if (nextlev[mv] == undefined)
               nextlev[mv] = 0 ;
            nextlev[mv] += (orders[mv]-1) * cnt ;
         }
      }
      disp("" + d + ": canonseq " + sum + " states " + uniq) ;
      curlev = nextlev ;
   }
}
