export class Perm {
   n:number ;        // length
   p:Array<number> ; // The permutation itself
   constructor(a:Array<number>) {
      this.n = a.length ;
      this.p = a ;
   }
   toString():string { // stringify
      return 'Perm[' + this.p.join(' ') + ']' ;
   }
   mul(p2:Perm):Perm { // multiply
      var c:Array<number> = Array(this.n) ;
      for (var i=0; i<this.n; i++)
         c[i] = p2.p[this.p[i]] ;
      return new Perm(c) ;
   }
   rmul(p2:Perm):Perm { // multiply the other way
      var c = Array(this.n) ;
      for (var i=0; i<this.n; i++)
         c[i] = this.p[p2.p[i]] ;
      return new Perm(c) ;
   }
   inv():Perm {
      var c = Array(this.n) ;
      for (var i=0; i<this.n; i++)
         c[this.p[i]] = i ;
      return new Perm(c) ;
   }
   static zeros(n:number):Array<number> {
      var c = Array(n) ;
      for (var i=0; i<n; i++)
         c[i] = 0 ;
      return c ;
   }
   static iota(n:number):Array<number> {
      var c = Array(n) ;
      for (var i=0; i<n; i++)
         c[i] = i ;
      return c ;
   }
   static e(n:number):Perm {
      return new Perm(Perm.iota(n)) ;
   }
   static random(n:number) { // random
      var c = Array(n) ;
      for (var i=0; i<n; i++)
         c[i] = i ;
      for (var i=0; i<n; i++) {
         var j = i + Math.floor((n-i)*Math.random()) ;
         var t = c[i] ;
         c[i] = c[j] ;
         c[j] = t ;
      }
      return new Perm(c) ;
   }
   compareTo(p2:Perm):number { // comparison
      for (var i=0; i<this.n; i++)
         if (this.p[i] != p2.p[i])
            return this.p[i]-p2.p[i] ;
      return 0 ;
   }
   toGap():string {
      var cyc = new Array<string>() ;
      var seen = new Array<boolean>(this.n) ;
      for (var i=0; i<this.p.length; i++) {
         if (seen[i] || this.p[i] == i)
            continue ;
         var incyc = new Array<number>() ;
         for (var j=i; !seen[j]; j=this.p[j]) {
            incyc.push(1+j) ;
            seen[j] = true ;
         }
         cyc.push("("+incyc.join(",")+")") ;
      }
      return cyc.join("") ;
   }
   static factorial(a:number):number {
      var r = 1 ;
      while (a > 1) {
         r *= a ;
         a-- ;
      }
      return r ;
   }
   static gcd(a:number, b:number):number {
      if (a > b) {
         var t = a ;
         a = b ;
         b = t ;
      }
      while (a > 0) {
         var m = b % a ;
         b = a ;
         a = m ;
      }
      return b ;
   }
   static lcm(a:number, b:number):number {
      return a / Perm.gcd(a, b) * b ;
   }
   order():number {
      var r = 1 ;
      var seen = new Array<boolean>(this.n) ;
      for (var i=0; i<this.p.length; i++) {
         if (seen[i] || this.p[i] == i)
            continue ;
         var cs = 0 ;
         for (var j=i; !seen[j]; j=this.p[j]) {
            cs++ ;
            seen[j] = true ;
         }
         r = Perm.lcm(r, cs) ;
      }
      return r ;
   }
}
