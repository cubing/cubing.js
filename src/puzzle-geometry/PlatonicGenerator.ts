import { Quat } from "./Quat" ;

// Next we define a class that yields quaternion generators for each of
// the five platonic solids.  The quaternion generators chosen are
// chosen specifically so that the first quaternion doubles as a plane
// description that yields the given Platonic solid (so for instance, the
// cubical group and octahedral group are identical in math, but we
// give distinct representations choosing the first quaternion so that
// we get the desired figure.)  Our convention is one vertex of the
// shape points precisely down.

// This class is static.

export class PlatonicGenerator {
   static eps = 1e-9 ;
   static cube():Array<Quat> {
      var s5 = Math.sqrt(0.5) ;
      return [new Quat(s5, s5, 0, 0), new Quat(s5, 0, s5, 0)] ;
   }
   static tetrahedron():Array<Quat> {
      return [new Quat(0.5, 0.5, 0.5, 0.5), new Quat(0.5, 0.5, 0.5, -0.5)] ;
   }
   static dodecahedron():Array<Quat> {
      var d36 = 2 * Math.PI / 10 ;
      var dx = 0.5 + 0.3 * Math.sqrt(5) ;
      var dy = 0.5 + 0.1 * Math.sqrt(5) ;
      var dd = Math.sqrt(dx*dx+dy*dy) ;
      dx /= dd ;
      dy /= dd ;
      return [new Quat(Math.cos(d36), dx*Math.sin(d36), dy*Math.sin(d36), 0),
              new Quat(0.5, 0.5, 0.5, 0.5)] ;
   }
   static icosahedron():Array<Quat> {
      var dx = 1/6 + Math.sqrt(5)/6 ;
      var dy = 2/3 + Math.sqrt(5)/3 ;
      var dd = Math.sqrt(dx*dx+dy*dy) ;
      dx /= dd ;
      dy /= dd ;
      var ang = 2 * Math.PI / 6 ;
      return [new Quat(Math.cos(ang), dx*Math.sin(ang), dy*Math.sin(ang), 0),
              new Quat(Math.cos(ang), -dx*Math.sin(ang), dy*Math.sin(ang), 0)] ;
   }
   static octahedron():Array<Quat> {
      var s5 = Math.sqrt(0.5) ;
      return [new Quat(0.5, 0.5, 0.5, 0.5), new Quat(s5, 0, 0, s5)] ;
   }
   static closure(g:Array<Quat>):Array<Quat> {
   // compute the closure of a set of generators
   // This is quadratic in the result size.  Also, it has no protection
   // against you providing a bogus set of generators that would generate
   // an infinite group.
      var q = [new Quat(1, 0, 0, 0)] ;
      for (var i=0; i<q.length; i++) {
         for (var j=0; j<g.length; j++) {
            var ns = g[j].mul(q[i]) ;
            var negns = ns.smul(-1) ;
            var wasseen = false ;
            for (var k=0; k<q.length; k++) {
               if (ns.dist(q[k]) < PlatonicGenerator.eps ||
                   negns.dist(q[k]) < PlatonicGenerator.eps) {
                  wasseen = true ;
                  break ;
               }
            }
            if (!wasseen) {
               q.push(ns) ;
            }
         }
      }
      return q ;
   }
   static uniqueplanes(p:Quat,g:Array<Quat>):Array<Quat> {
   // compute unique plane rotations
   // given a rotation group and a plane, find the rotations that
   // generate unique planes.  This is quadratic in the return size.
      var planes = [] ;
      var planerot = [] ;
      for (var i=0; i<g.length; i++) {
         var p2 = p.rotateplane(g[i]) ;
         var wasseen = false ;
         for (var j=0; j<planes.length; j++) {
            if (p2.dist(planes[j]) < PlatonicGenerator.eps) {
               wasseen = true ;
               break ;
            }
         }
         if (!wasseen) {
            planes.push(p2) ;
            planerot.push(g[i]) ;
         }
      }
      return planerot ;
   }
   static getface(planes:Array<Quat>):Array<Quat> {
   // compute a face given a set of planes
   // The face returned will be a set of points that lie in the first plane
   // in the given array, that are on the surface of the polytope defined
   // by all the planes, and will be returned in clockwise order.
   // This is O(planes^2 * return size + return_size^2).
      var face = [] ;
      for (var i=1; i<planes.length; i++) {
         for (var j=i+1; j<planes.length; j++) {
            var p = planes[0].solvethreeplanes(0, i, j, planes) ;
            if (p) {
               var wasseen = false ;
               for (var k=0; k<face.length; k++) {
                  if (p.dist(face[k]) < PlatonicGenerator.eps) {
                     wasseen = true ;
                     break ;
                  }
               }
               if (!wasseen)
                  face.push(p) ;
            }
         }
      }
      while (true) {
         var changed = false ;
         for (var i=0; i<face.length; i++) {
            var j = (i + 1) % face.length ;
            if (planes[0].dot(face[i].cross(face[j])) < 0) {
               var t:Quat = face[i] ;
               face[i] = face[j] ;
               face[j] = t ;
               changed = true ;
            }
         }
         if (!changed)
            break ;
      }
      return face ;
   }
}
