/* tslint:disable prefer-for-of */ // TODO

import { Quat, solvethreeplanes } from "./Quat";

// Next we define a class that yields quaternion generators for each of
// the five platonic solids.  The quaternion generators chosen are
// chosen specifically so that the first quaternion doubles as a plane
// description that yields the given Platonic solid (so for instance, the
// cubical group and octahedral group are identical in math, but we
// give distinct representations choosing the first quaternion so that
// we get the desired figure.)  Our convention is one vertex of the
// shape points precisely down.

// This class is static.

const eps = 1e-9; // TODO: Deduplicate with `PuzzleGeometry`?

export function cube(): Quat[] {
  const s5 = Math.sqrt(0.5);
  return [new Quat(s5, s5, 0, 0), new Quat(s5, 0, s5, 0)];
}

export function tetrahedron(): Quat[] {
  return [new Quat(0.5, 0.5, 0.5, 0.5), new Quat(0.5, 0.5, 0.5, -0.5)];
}

export function dodecahedron(): Quat[] {
  const d36 = (2 * Math.PI) / 10;
  let dx = 0.5 + 0.3 * Math.sqrt(5);
  let dy = 0.5 + 0.1 * Math.sqrt(5);
  const dd = Math.sqrt(dx * dx + dy * dy);
  dx /= dd;
  dy /= dd;
  return [
    new Quat(Math.cos(d36), dx * Math.sin(d36), dy * Math.sin(d36), 0),
    new Quat(0.5, 0.5, 0.5, 0.5),
  ];
}

export function icosahedron(): Quat[] {
  let dx = 1 / 6 + Math.sqrt(5) / 6;
  let dy = 2 / 3 + Math.sqrt(5) / 3;
  const dd = Math.sqrt(dx * dx + dy * dy);
  dx /= dd;
  dy /= dd;
  const ang = (2 * Math.PI) / 6;
  return [
    new Quat(Math.cos(ang), dx * Math.sin(ang), dy * Math.sin(ang), 0),
    new Quat(Math.cos(ang), -dx * Math.sin(ang), dy * Math.sin(ang), 0),
  ];
}

export function octahedron(): Quat[] {
  const s5 = Math.sqrt(0.5);
  return [new Quat(0.5, 0.5, 0.5, 0.5), new Quat(s5, 0, 0, s5)];
}

export function closure(g: Quat[]): Quat[] {
  // compute the closure of a set of generators
  // This is quadratic in the result size.  Also, it has no protection
  // against you providing a bogus set of generators that would generate
  // an infinite group.
  const q = [new Quat(1, 0, 0, 0)];
  for (let i = 0; i < q.length; i++) {
    for (let j = 0; j < g.length; j++) {
      const ns = g[j].mul(q[i]);
      const negns = ns.smul(-1);
      let wasseen = false;
      for (let k = 0; k < q.length; k++) {
        if (ns.dist(q[k]) < eps || negns.dist(q[k]) < eps) {
          wasseen = true;
          break;
        }
      }
      if (!wasseen) {
        q.push(ns);
      }
    }
  }
  return q;
}

export function uniqueplanes(p: Quat, g: Quat[]): Quat[] {
  // compute unique plane rotations
  // given a rotation group and a plane, find the rotations that
  // generate unique planes.  This is quadratic in the return size.
  const planes = [];
  const planerot = [];
  for (let i = 0; i < g.length; i++) {
    const p2 = p.rotateplane(g[i]);
    let wasseen = false;
    for (let j = 0; j < planes.length; j++) {
      if (p2.dist(planes[j]) < eps) {
        wasseen = true;
        break;
      }
    }
    if (!wasseen) {
      planes.push(p2);
      planerot.push(g[i]);
    }
  }
  return planerot;
}

export function getface(planes: Quat[]): Quat[] {
  // compute a face given a set of planes
  // The face returned will be a set of points that lie in the first plane
  // in the given array, that are on the surface of the polytope defined
  // by all the planes, and will be returned in clockwise order.
  // This is O(planes^2 * return size + return_size^2).
  const face: Quat[] = [];
  for (let i = 1; i < planes.length; i++) {
    for (let j = i + 1; j < planes.length; j++) {
      const p = solvethreeplanes(0, i, j, planes);
      if (p) {
        let wasseen = false;
        for (let k = 0; k < face.length; k++) {
          if (p.dist(face[k]) < eps) {
            wasseen = true;
            break;
          }
        }
        if (!wasseen) {
          face.push(p);
        }
      }
    }
  }
  for (;;) {
    let changed = false;
    for (let i = 0; i < face.length; i++) {
      const j: number = (i + 1) % face.length;
      if (planes[0].dot(face[i].cross(face[j])) < 0) {
        const t: Quat = face[i];
        face[i] = face[j];
        face[j] = t;
        changed = true;
      }
    }
    if (!changed) {
      break;
    }
  }
  return face;
}
