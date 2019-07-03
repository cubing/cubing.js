import { Perm } from "./Perm" ;
class FactoredNumber {
   mult:Array<number>
   constructor() {
      this.mult = [] ;
   }
   multiply(n:number):void {
      for (var f=2; f*f<=n; f++) {
         while (n % f == 0) {
            if (undefined != this.mult[f])
               this.mult[f]++ ;
            else
               this.mult[f] = 1 ;
            n /= f ;
         }
      }
      if (n > 1) {
         if (undefined != this.mult[n])
            this.mult[n]++ ;
         else
            this.mult[n] = 1 ;
      }
   }
   toString():string {
      var r = "" ;
      for (var i=0; i<this.mult.length; i++)
         if (undefined != this.mult[i]) {
            if (r != "")
               r += "*" ;
            r += i ;
            if (this.mult[i] > 1)
               r += "^" + this.mult[i] ;
         }
      return r ;
   }
}
export class SchreierSims {
   static schreiersims(g:Array<Perm>, disp:(s:string)=>void):number {
      var n = g[0].p.length ;
      var e = Perm.e(n) ;
      var sgs:Array<Array<Perm>> = [] ;
      var sgsi:Array<Array<Perm>> = [] ;
      var sgslen:Array<Array<number>> = [] ;
      var Tk:Array<Array<Perm>> = [] ;
      var Tklen:Array<Array<number>> = [] ;
      function resolve(p:Perm):boolean {
         for (var i=p.p.length-1; i>=0; i--) {
            var j = p.p[i] ;
            if (j != i) {
               if (!sgs[i][j])
                  return false ;
               p = p.mul(sgsi[i][j]) ;
            }
         }
         return true ;
      }
      function knutha(k:number, p:Perm, len:number):void {
         Tk[k].push(p) ;
         Tklen[k].push(len) ;
         for (var i=0; i<sgs[k].length; i++)
            if (sgs[k][i])
               knuthb(k, sgs[k][i].mul(p), len+sgslen[k][i]) ;
      }
      function knuthb(k:number, p:Perm, len:number):void {
         var j = p.p[k] ;
         if (!sgs[k][j]) {
            sgs[k][j] = p ;
            sgsi[k][j] = p.inv() ;
            sgslen[k][j] = len ;
            for (var i=0; i<Tk[k].length; i++)
               knuthb(k, p.mul(Tk[k][i]), len+Tklen[k][i]) ;
            return ;
         }
         var p2 = p.mul(sgsi[k][j]) ;
         if (!resolve(p2))
            knutha(k-1, p2, len+sgslen[k][j]) ;
      }
      function getsgs():number {
         sgs = [] ;
         sgsi = [] ;
         Tk = [] ;
         sgslen = [] ;
         Tklen = [] ;
         for (var i=0; i<n; i++) {
            sgs.push([]) ;
            sgsi.push([]) ;
            sgslen.push([]) ;
            Tk.push([]) ;
            Tklen.push([]) ;
            sgs[i][i] = e ;
            sgsi[i][i] = e ;
            sgslen[i][i] = 0 ;
         }
         var avgs = [] ;
         var none = 0 ;
         var sz = 1 ;
         for (var i=0; i<g.length; i++) {
            knutha(n-1, g[i], 1) ;
            sz = 1 ;
            var tks = 0 ;
            var sollen = 0 ;
            var avgs = [] ;
            var mults = new FactoredNumber() ;
            for (var j=0; j<n; j++) {
               var cnt = 0 ;
               var lensum = 0 ;
               for (var k=0; k<n; k++)
                  if (sgs[j][k]) {
                     cnt++ ;
                     lensum += sgslen[j][k] ;
                     if (j != k)
                        none++ ;
                  }
               tks += Tk[j].length ;
               sz *= cnt ;
               if (cnt > 1)
                  mults.multiply(cnt) ;
               var avg = lensum / cnt ;
               avgs.push(avg) ;
               sollen += avg ;
            }
            disp("" + i + ": sz " + sz + " T " + tks + " sol " + sollen + " none " + none + " mults " + mults) ;
         }
         return sz ;
      }
      return getsgs() ;
   }
}
